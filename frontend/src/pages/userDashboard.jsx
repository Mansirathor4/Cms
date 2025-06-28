// src/userDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import ComplaintForm from '../components/complaintForm';
import Header from '../components/header';
import Footer from '../components/footer';
import formatDate from '../utils/formatDate'; // Import the helper

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const token = localStorage.getItem('token');

  const fetchUserComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the updated endpoint for user complaints
      const res = await axios.get('http://localhost:5000/api/complaints/user-complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch user complaints', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserComplaints();
    } else {
      setError("No token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  const handleFeedbackClick = (complaint) => {
    setSelectedComplaint(complaint);
    // Initialize modal fields with current feedback data if it exists
    setFeedbackStatus(complaint.feedback?.status && complaint.feedback.status !== 'PENDING' ? complaint.feedback.status : '');
    setFeedbackComment(complaint.feedback?.comment || '');
    setFeedbackMessage('');
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedComplaint || !feedbackStatus) {
      setFeedbackMessage('Please select a feedback status.');
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/complaints/feedback/${selectedComplaint._id}`,
        {
          feedbackStatus, // Send the new feedback status
          comment: feedbackComment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbackMessage(res.data.message || 'Feedback submitted successfully!');
      fetchUserComplaints(); // Refresh complaints to show updated feedback
      setShowFeedbackModal(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackMessage('Failed to submit feedback: ' + (err.response?.data?.message || 'Server error.'));
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header title="USER DASHBOARD" />

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full"> {/* Increased max-w and added w-full */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-orange-600 mb-6"
        >
          File a New Complaint
        </motion.h1>

        {/* Complaint Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <ComplaintForm onSuccess={fetchUserComplaints} /> {/* Changed to fetchUserComplaints */}
        </motion.div>

        {/* Complaint List */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-blue-700 mb-4"
        >
          Your Previous Complaints
        </motion.h2>

        {loading && <p className="text-gray-500 text-center">Loading complaints...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {!loading && !error && complaints.length === 0 ? (
          <p className="text-gray-600">You have not filed any complaints yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-300">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Assignee Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Completion Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Your Feedback</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Feedback Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-200">
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="border-t border-orange-200 hover:bg-orange-50 transition">
                    <td className="px-4 py-2 whitespace-nowrap text-blue-600 font-medium text-sm">{complaint._id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.department}</td>
                    <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis">{complaint.description}</td>
                    <td className="px-4 py-2 whitespace-nowrap capitalize text-sm font-semibold">
                      <span
                        className={
                          complaint.workStatus === 'DONE' ? 'text-green-600' :
                          complaint.workStatus === 'PARTIALLY_DONE' ? 'text-yellow-600' :
                          complaint.workStatus === 'IN_PROGRESS' ? 'text-blue-500' :
                          complaint.workStatus === 'CLOSED_BY_USER' || complaint.workStatus === 'CLOSED_BY_COORDINATOR' ? 'text-gray-600' :
                          complaint.workStatus === 'REOPENED' ? 'text-purple-600' :
                          'text-red-600' // PENDING
                        }
                      >
                        {complaint.workStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis">{complaint.remarks || 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{formatDate(complaint.completionDate)}</td>
                    <td className="px-4 py-2 text-gray-800 text-sm">
                      {complaint.feedback?.status?.replace('_', ' ') || 'No Feedback'}
                      {complaint.feedback?.comment && `: "${complaint.feedback.comment}"`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{formatDate(complaint.feedback?.date)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      {(complaint.workStatus === 'DONE' || complaint.workStatus === 'PARTIALLY_DONE') &&
                       (!complaint.feedback || complaint.feedback.status === 'PENDING') && (
                        <button
                          onClick={() => handleFeedbackClick(complaint)}
                          className="text-green-600 hover:text-green-900 bg-green-100 py-1 px-3 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                          Give Feedback
                        </button>
                      )}
                      {complaint.feedback && complaint.feedback.status !== 'PENDING' && (
                         <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">
                           Feedback Given
                         </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-4">
                Provide Feedback for Complaint ID: {selectedComplaint._id}
              </h3>
              <p className="mb-2 text-gray-700">Description: {selectedComplaint.description}</p>
              <p className="mb-4 text-gray-700">Assignee Remarks: {selectedComplaint.remarks || 'N/A'}</p>

              <div className="mb-4">
                <label htmlFor="feedbackStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  How satisfied are you with the work?
                </label>
                <select
                  id="feedbackStatus"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={feedbackStatus}
                  onChange={(e) => setFeedbackStatus(e.target.value)}
                  required
                >
                  <option value="">-- Select Feedback --</option>
                  <option value="SATISFIED">Completely Satisfied</option>
                  <option value="PARTIALLY_SATISFIED">Partially Satisfied</option>
                  <option value="NOT_SATISFIED">Not Satisfied</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="feedbackComment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional):
                </label>
                <textarea
                  id="feedbackComment"
                  rows="3"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Add any comments about the work..."
                ></textarea>
              </div>

              {feedbackMessage && (
                <p className={`text-center mb-4 ${feedbackMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {feedbackMessage}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Submit Feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default UserDashboard;