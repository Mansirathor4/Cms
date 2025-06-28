const express = require('express');
const Complaint = require('../models/complaint');
const sendMail = require('../utils/sendMail');
const User = require('../models/user'); 

// Helper to format date for email consistency (duplicate from routes, but needed here too)
const formatEmailDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true, timeZone: 'Asia/Kolkata'
    });
};

// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const {
      department,
      reportedBy,
      dispatchNo,
      requestedBy,
      date,
      roomLocation,
      description,
      isUrgent,
    } = req.body;

    const complaint = new Complaint({
            department,
            reportedBy: req.user.name, // Use authenticated user's name
            dispatchNo,
            requestedBy,
            date: new Date(), // Set current date
            roomLocation,
            description,
            isUrgent,
            complainant: req.user._id, // Set complainant from authenticated user
            workStatus: 'PENDING', // Initial status
        });


    const savedComplaint = await complaint.save();
    // --- Notification to Coordinator on New Complaint ---
        const coordinator = await User.findOne({ role: 'coordinator' });
        if (coordinator) {
            const emailSubject = `New Complaint Filed: #${savedComplaint._id}`;
            const emailHtml = `
                <p>Dear ${coordinator.name},</p>
                <p>A new complaint has been filed by ${req.user.name} (${req.user.email}).</p>
                <p><strong>Complaint ID:</strong> ${savedComplaint._id}</p>
                <p><strong>Department:</strong> ${savedComplaint.department}</p>
                <p><strong>Description:</strong> ${savedComplaint.description}</p>
                <p><strong>Room/Location:</strong> ${savedComplaint.roomLocation}</p>
                <p><strong>Urgent:</strong> ${savedComplaint.isUrgent ? 'Yes' : 'No'}</p>
                <p><strong>Filed On:</strong> ${formatEmailDate(savedComplaint.date)}</p>
                <p>Please log in to the dashboard to review and assign this complaint.</p>
                <p>Thank you,</p>
                <p>Complaint Management System</p>
            `;
            await sendMail(coordinator.email, emailSubject, emailHtml);
        }

    res.status(201).json({ message: 'Complaint filed successfully', complaint });
  } catch (err) {
    console.error("Error saving complaint:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get complaints created by the logged-in user
exports.getUserComplaints = async (req, res) => {
    try {
        // Populate relevant fields for display on the user dashboard
        const complaints = await Complaint.find({ complainant: req.user._id })
            .populate('assignedDivisionHead', 'name email')
            .populate('assignedTo', 'name email'); // User can see who it's assigned to

        res.json(complaints);
    } catch (err) {
        console.error('Failed to fetch user complaints:', err);
        res.status(500).json({ message: 'Server error' });
    }
};