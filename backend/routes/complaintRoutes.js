const express = require('express');
const router = express.Router();
const Complaint = require('../models/complaint');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/user');
const sendMail = require('../utils/sendMail');


// --- Helper to format date for email consistency ---
const formatEmailDate = (date) => {
    if (!date) return 'N/A';
    // Ensure consistent timezone, e.g., 'en-IN' for India, 'Asia/Kolkata' for IST
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Kolkata'
    });
};


//File a new complaint
const { createComplaint, getUserComplaints } = require('../controllers/complaintController');
router.post('/', authenticate, async (req, res, next) => {
    // Intercept createComplaint to add email logic
    try {
        next(); // Proceed to createComplaint
    } catch (err) {
        // This catch block is for errors in this middleware, not createComplaint itself
        console.error("Error in complaint creation route:", err);
        res.status(500).json({ message: 'Server error during complaint creation process.' });
    }
}, createComplaint); // This will call createComplaint from the controller

// --- Get complaints created by the logged-in user (User Dashboard) ---
router.get('/user-complaints', authenticate, async (req, res) => { // Renamed from '/user' for clarity
    try {
        const complaints = await Complaint.find({ complainant: req.user._id })
            .populate('assignedDivisionHead', 'name email')
            .populate('assignedTo', 'name email'); // Populate assignee for user to see who did the work

        res.status(200).json(complaints);
    } catch (err) {
        console.error('Error fetching user complaints:', err);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// Get complaints assigned to the logged-in assignee
router.get('/assigned', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'assignee') return res.status(403).json({ message: 'Access denied' });
        const complaints = await Complaint.find({ assignedTo: req.user._id })
            .populate('complainant', 'name userId email'); // Populate complainant details
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all complaints (for coordinator)
router.get('/all', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'coordinator') return res.status(403).json({ message: 'Access denied' });

        const complaints = await Complaint.find()
            .populate('complainant', 'name userId email')
            .populate('assignedDivisionHead', 'name email')
            .populate('assignedTo', 'name email'); // Populate assignee here too for completeness
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get complaints assigned to the logged-in Division Head
router.get('/assigned-division-head', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'divisionHead') {
            return res.status(403).json({ message: 'Access denied. Not a Division Head.' });
        }

        const complaints = await Complaint.find({ assignedDivisionHead: req.user._id })
            .populate('assignedTo', 'name email')
            .populate('complainant', 'name userId email'); // Populate complainant details

        res.json(complaints);
    } catch (err) {
        console.error('Error fetching complaints for division head:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Assign complaint to Division Head
router.put('/assign-division-head/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'coordinator') return res.status(403).json({ message: 'Access denied' });

        const { divisionHeadId, assignedDivision } = req.body; // Expect assignedDivision from frontend
        const complaintId = req.params.id;

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            {
                assignedDivisionHead: divisionHeadId,
                assignedDivision: assignedDivision, // Set the division
                workStatus: 'PENDING', // Status remains PENDING until assignee starts work
                assignedTo: null, // Clear assignee if re-assigning DH
                remarks: '', // Clear previous remarks on re-assignment
                completionDate: null // Clear previous completion date
            },
            { new: true }
        ).populate('assignedDivisionHead', 'name email')
         .populate('complainant', 'name email'); // Populate complainant for email

        if (!updatedComplaint) return res.status(404).json({ message: 'Complaint not found' });

        // --- Notification to Division Head ---
        const divisionHead = await User.findById(divisionHeadId);
        if (divisionHead) {
            const emailSubject = `New Complaint Assigned: #${updatedComplaint._id}`;
            const emailHtml = `
                <p>Dear ${divisionHead.name},</p>
                <p>A new complaint has been assigned to your division by Coordinator (${req.user.name}).</p>
                <p><strong>Complaint ID:</strong> ${updatedComplaint._id}</p>
                <p><strong>Department:</strong> ${updatedComplaint.department}</p>
                <p><strong>Description:</strong> ${updatedComplaint.description}</p>
                <p><strong>Room/Location:</strong> ${updatedComplaint.roomLocation}</p>
                <p><strong>Assigned On:</strong> ${formatEmailDate(new Date())}</p>
                <p>Please log in to the dashboard to review and assign this complaint to an assignee.</p>
                <p>Thank you,</p>
                <p>Complaint Management System</p>
            `;
            await sendMail(divisionHead.email, emailSubject, emailHtml);
        }

        res.json({ message: 'Complaint assigned to Division Head', complaint: updatedComplaint });
    } catch (err) {
        console.error("Error assigning complaint to division head:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this route to assign a complaint to an Assignee
router.put('/assign-assignee/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'divisionHead') return res.status(403).json({ message: 'Access denied' });

        const { assigneeId } = req.body;
        const complaintId = req.params.id;

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            {
                assignedTo: assigneeId,
                workStatus: 'IN_PROGRESS', // Status changes to IN_PROGRESS when assigned to assignee
                remarks: '', // Clear previous remarks on re-assignment
                completionDate: null // Clear previous completion date
            },
            { new: true }
        ).populate('assignedTo', 'name email')
         .populate('complainant', 'name email'); // Populate complainant for email

        if (!updatedComplaint) return res.status(404).json({ message: 'Complaint not found' });

        // --- Notification to Assignee ---
        const assignee = await User.findById(assigneeId);
        if (assignee) {
            const emailSubject = `Complaint Assigned for Work: #${updatedComplaint._id}`;
            const emailHtml = `
                <p>Dear ${assignee.name},</p>
                <p>A new complaint has been assigned to you by Division Head (${req.user.name}).</p>
                <p><strong>Complaint ID:</strong> ${updatedComplaint._id}</p>
                <p><strong>Department:</strong> ${updatedComplaint.department}</p>
                <p><strong>Description:</strong> ${updatedComplaint.description}</p>
                <p><strong>Room/Location:</strong> ${updatedComplaint.roomLocation}</p>
                <p><strong>Assigned On:</strong> ${formatEmailDate(new Date())}</p>
                <p>Please log in to the dashboard to view details and update the work status.</p>
                <p>Thank you,</p>
                <p>Complaint Management System</p>
            `;
            await sendMail(assignee.email, emailSubject, emailHtml);
        }

        res.json({ message: 'Complaint assigned to Assignee', complaint: updatedComplaint });
    } catch (err) {
        console.error("Error assigning complaint to assignee:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update work status, remarks, and automatically set completion date
router.put('/update-work-status/:id', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'assignee') {
            return res.status(403).json({ message: 'Access denied. Not an assignee.' });
        }

        const { workStatus, remarks } = req.body;
        const complaintId = req.params.id;

        const complaint = await Complaint.findOne({ _id: complaintId, assignedTo: req.user._id });

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found or not assigned to you.' });
        }

        const oldWorkStatus = complaint.workStatus; // Store old status for comparison

        const updateFields = {
            workStatus,
            remarks,
        };

        // Auto-set or clear completionDate based on workStatus
        if (workStatus === 'DONE' || workStatus === 'PARTIALLY_DONE') {
            if (oldWorkStatus !== workStatus || complaint.completionDate === null) {
                updateFields.completionDate = new Date();
            }
        } else {
            updateFields.completionDate = null; // Clear completion date if status is not DONE or PARTIALLY_DONE
        }

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            updateFields,
            { new: true }
        ).populate('complainant', 'name email') // Populate complainant for email
         .populate('assignedDivisionHead', 'name email'); // Populate DH for email

        if (!updatedComplaint) {
            return res.status(404).json({ message: 'Complaint not found after update attempt.' });
        }

        // --- Notifications for Work Status Change ---
        if (oldWorkStatus !== updatedComplaint.workStatus) { // Only send email if status actually changed
            // Notify Division Head
            if (updatedComplaint.assignedDivisionHead) {
                const divisionHead = await User.findById(updatedComplaint.assignedDivisionHead._id);
                if (divisionHead) {
                    const emailSubject = `Complaint Status Update: #${updatedComplaint._id} - ${updatedComplaint.workStatus.replace('_', ' ')}`;
                    const emailHtml = `
                        <p>Dear ${divisionHead.name},</p>
                        <p>The work status for complaint <strong>#${updatedComplaint._id}</strong> has been updated by ${req.user.name} (Assignee).</p>
                        <p><strong>Description:</strong> ${updatedComplaint.description}</p>
                        <p><strong>New Status:</strong> ${updatedComplaint.workStatus.replace('_', ' ')}</p>
                        <p><strong>Remarks:</strong> ${updatedComplaint.remarks || 'No remarks provided.'}</p>
                        <p><strong>Completion Date:</strong> ${formatEmailDate(updatedComplaint.completionDate)}</p>
                        <p>Please log in to the dashboard to review.</p>
                        <p>Thank you,</p>
                        <p>Complaint Management System</p>
                    `;
                    await sendMail(divisionHead.email, emailSubject, emailHtml);
                }
            }

            // Notify User (if status is DONE or PARTIALLY_DONE)
            if (updatedComplaint.complainant && (updatedComplaint.workStatus === 'DONE' || updatedComplaint.workStatus === 'PARTIALLY_DONE')) {
                const user = await User.findById(updatedComplaint.complainant._id);
                if (user) {
                    const emailSubject = `Your Complaint Work Status: #${updatedComplaint._id} - ${updatedComplaint.workStatus.replace('_', ' ')}`;
                    const emailHtml = `
                        <p>Dear ${user.name},</p>
                        <p>The work on your complaint <strong>#${updatedComplaint._id}</strong> regarding "${updatedComplaint.description}" has been updated to <strong>${updatedComplaint.workStatus.replace('_', ' ')}</strong> by the assigned team.</p>
                        <p><strong>Remarks:</strong> ${updatedComplaint.remarks || 'No remarks provided.'}</p>
                        <p><strong>Completion Date:</strong> ${formatEmailDate(updatedComplaint.completionDate)}</p>
                        <p>Please log in to your dashboard to provide your feedback.</p>
                        <p>Thank you,</p>
                        <p>Complaint Management System</p>
                    `;
                    await sendMail(user.email, emailSubject, emailHtml);
                }
            }
        }

        res.json({ message: 'Work status and details updated successfully', complaint: updatedComplaint });
    } catch (err) {
        console.error('Error updating work status:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Fetch complaints eligible for feedback by the logged-in user
router.get('/user-feedback-pending', authenticate, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      complainant: req.user._id,
      workStatus: { $in: ['DONE', 'PARTIALLY_DONE'] },
      'feedback.workCompletelySatisfied': false,
      'feedback.partiallySatisfied': false,
      'feedback.notSatisfied': false,
    });

    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Submit feedback
router.put('/feedback/:complaintId', authenticate, async (req, res) => {
    const { complaintId } = req.params;
    const { feedbackStatus, comment } = req.body; // Use feedbackStatus
    const validFeedbackStatuses = ['SATISFIED', 'PARTIALLY_SATISFIED', 'NOT_SATISFIED'];

    if (!validFeedbackStatuses.includes(feedbackStatus)) {
        return res.status(400).json({ message: 'Invalid feedback status provided.' });
    }

    try {
        const complaint = await Complaint.findOne({ _id: complaintId, complainant: req.user._id });

        if (!complaint) return res.status(404).json({ message: 'Complaint not found or not authorized' });
        if (complaint.feedback.status !== 'PENDING') return res.status(400).json({ message: 'Feedback already submitted for this complaint.' });
        if (!(complaint.workStatus === 'DONE' || complaint.workStatus === 'PARTIALLY_DONE')) {
             return res.status(400).json({ message: 'Work not yet done or partially done. Cannot submit feedback.' });
        }

        complaint.feedback.status = feedbackStatus;
        complaint.feedback.comment = comment || '';
        complaint.feedback.date = new Date(); // Record feedback submission date
        complaint.workStatus = 'CLOSED_BY_USER'; // Indicate user has provided feedback

        const updatedComplaint = await complaint.save();

        // --- Notification to Coordinator on User Feedback ---
        const coordinator = await User.findOne({ role: 'coordinator' });
        if (coordinator) {
            const emailSubject = `User Feedback Received: #${updatedComplaint._id}`;
            const emailHtml = `
                <p>Dear ${coordinator.name},</p>
                <p>User feedback has been received for complaint <strong>#${updatedComplaint._id}</strong> (reported by ${req.user.name}).</p>
                <p><strong>Complaint Description:</strong> ${updatedComplaint.description}</p>
                <p><strong>Feedback Status:</strong> ${feedbackStatus.replace('_', ' ')}</p>
                <p><strong>User Comment:</strong> ${comment || 'No comment.'}</p>
                <p><strong>Feedback Submitted On:</strong> ${formatEmailDate(updatedComplaint.feedback.date)}</p>
                <p><strong>Complaint Status (from Assignee):</strong> ${updatedComplaint.workStatus.replace('_', ' ')}</p>
                <p>Please log in to your dashboard to review the feedback and decide on final closure or reopening.</p>
                <p>Thank you,</p>
                <p>Complaint Management System</p>
            `;
            await sendMail(coordinator.email, emailSubject, emailHtml);
        }

        res.status(200).json({ message: 'Feedback submitted successfully', complaint: updatedComplaint });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
});

// --- Coordinator Actions: Reopen or Close Complaint ---
router.put('/coordinator-action/:complaintId', authenticate, async (req, res) => {
    if (req.user.role !== 'coordinator') {
        return res.status(403).json({ message: 'Access denied. Only coordinators can perform this action.' });
    }

    const { complaintId } = req.params;
    const { action, coordinatorRemarks } = req.body; // action can be 'reopen' or 'close'

    if (!['reopen', 'close'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action specified. Must be "reopen" or "close".' });
    }

    try {
        const complaint = await Complaint.findById(complaintId)
            .populate('complainant', 'name email')
            .populate('assignedDivisionHead', 'name email')
            .populate('assignedTo', 'name email');

        if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

        const updateFields = { coordinatorRemarks: coordinatorRemarks || '' };
        let emailSubject = '';
        let emailHtml = '';

        if (action === 'reopen') {
            // Reopen logic
            updateFields.workStatus = 'REOPENED';
            updateFields.isClosed = false;
            updateFields.reopenedCount = (complaint.reopenedCount || 0) + 1;
            // Clear assignment and work progress for re-assignment cycle
            updateFields.assignedTo = null;
            updateFields.assignedDivisionHead = null;
            updateFields.completionDate = null;
            updateFields.remarks = '';
            // Reset feedback for next cycle if needed, or keep it as historical data
            updateFields['feedback.status'] = 'PENDING';
            updateFields['feedback.comment'] = '';
            updateFields['feedback.date'] = null;

            emailSubject = `Complaint Reopened: #${complaint._id}`;
            emailHtml = `
                <p>Dear ${complaint.complainant.name},</p>
                <p>Your complaint <strong>#${complaint._id}</strong> regarding "${complaint.description}" has been **REOPENED** by the Coordinator (${req.user.name}).</p>
                <p><strong>Coordinator Remarks:</strong> ${coordinatorRemarks || 'No remarks provided.'}</p>
                <p>The complaint will be reassigned for further action. Please monitor your dashboard for updates.</p>
                <p><strong>Reopened On:</strong> ${formatEmailDate(new Date())}</p>
                <p>Thank you,</p>
                <p>Complaint Management System</p>
            `;
            await sendMail(complaint.complainant.email, emailSubject, emailHtml); // Notify complainant

            // Also notify previous DH and Assignee if necessary, or let Coordinator handle re-assignment
            if (complaint.assignedDivisionHead) {
                const dhEmailSubject = `Complaint Reopened (Info): #${complaint._id}`;
                const dhEmailHtml = `<p>Dear ${complaint.assignedDivisionHead.name},</p><p>Complaint #${complaint._id} (Description: ${complaint.description}) has been reopened by Coordinator ${req.user.name}. It will be reassigned.</p><p><strong>Reopened On:</strong> ${formatEmailDate(new Date())}</p>`;
                await sendMail(complaint.assignedDivisionHead.email, dhEmailSubject, dhEmailHtml);
            }
            if (complaint.assignedTo) {
                 const assigneeEmailSubject = `Complaint Reopened (Info): #${complaint._id}`;
                 const assigneeEmailHtml = `<p>Dear ${complaint.assignedTo.name},</p><p>Complaint #${complaint._id} (Description: ${complaint.description}) that you previously worked on has been reopened by Coordinator ${req.user.name}.</p><p><strong>Reopened On:</strong> ${formatEmailDate(new Date())}</p>`;
                 await sendMail(complaint.assignedTo.email, assigneeEmailSubject, assigneeEmailHtml);
            }


        } else if (action === 'close') {
            // Close logic
            updateFields.workStatus = 'CLOSED_BY_COORDINATOR';
            updateFields.isClosed = true;

            emailSubject = `Complaint Closed: #${complaint._id}`;
            emailHtml = `
                <p>Dear ${complaint.complainant.name},</p>
                <p>Your complaint <strong>#${complaint._id}</strong> regarding "${complaint.description}" has been **CLOSED** by the Coordinator (${req.user.name}).</p>
                <p><strong>Coordinator Remarks:</strong> ${coordinatorRemarks || 'No remarks provided.'}</p>
                <p>If you have any further issues, please file a new complaint.</p>
                <p><strong>Closed On:</strong> ${formatEmailDate(new Date())}</p>
                <p>Thank you for your patience,</p>
                <p>Complaint Management System</p>
            `;
            await sendMail(complaint.complainant.email, emailSubject, emailHtml); // Notify complainant

            // Notify DH and Assignee that it's closed
            if (complaint.assignedDivisionHead) {
                const dhEmailSubject = `Complaint Closed (Info): #${complaint._id}`;
                const dhEmailHtml = `<p>Dear ${complaint.assignedDivisionHead.name},</p><p>Complaint #${complaint._id} (Description: ${complaint.description}) has been closed by Coordinator ${req.user.name}.</p><p><strong>Closed On:</strong> ${formatEmailDate(new Date())}</p>`;
                await sendMail(complaint.assignedDivisionHead.email, dhEmailSubject, dhEmailHtml);
            }
            if (complaint.assignedTo) {
                 const assigneeEmailSubject = `Complaint Closed (Info): #${complaint._id}`;
                 const assigneeEmailHtml = `<p>Dear ${complaint.assignedTo.name},</p><p>Complaint #${complaint._id} (Description: ${complaint.description}) that you worked on has been closed by Coordinator ${req.user.name}.</p><p><strong>Closed On:</strong> ${formatEmailDate(new Date())}</p>`;
                 await sendMail(complaint.assignedTo.email, assigneeEmailSubject, assigneeEmailHtml);
            }
        }

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            updateFields,
            { new: true }
        )
        .populate('complainant', 'name email')
        .populate('assignedDivisionHead', 'name email')
        .populate('assignedTo', 'name email');

        res.json({ message: `Complaint ${action}ed successfully.`, complaint: updatedComplaint });

    } catch (err) {
        console.error(`Error performing coordinator action (${action}):`, err);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
