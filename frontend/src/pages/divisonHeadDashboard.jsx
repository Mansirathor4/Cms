// src/pages/divisionHeadDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/header';
import formatDate from '../utils/formatDate'; // Import the helper

const DivisionHeadDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [message, setMessage] = useState(''); // General message for modals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchAssignedComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/assigned-division-head', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints for Division Head:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignees = async () => {
    try {
      // Endpoint to fetch assignees for this DH's division (assuming this exists in userRoutes.js)
      const res = await axios.get('http://localhost:5000/api/users/assignees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignees(res.data);
    } catch (err) {
      console.error('Failed to fetch assignees:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssignedComplaints();
      fetchAssignees();
    } else {
      setError("No token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  const handleAssignClick = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedAssignee(complaint.assignedTo?._id || '');
    setMessage('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedComplaint || !selectedAssignee) {
      setMessage('Please select an assignee.');
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/complaints/assign-assignee/${selectedComplaint._id}`,
        { assigneeId: selectedAssignee },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || 'Complaint assigned successfully!');
      fetchAssignedComplaints(); // Refresh list
      setShowAssignModal(false);
    } catch (err) {
      console.error('Error assigning complaint:', err);
      setMessage('Failed to assign complaint: ' + (err.response?.data?.message || 'Server error.'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white"
    >
      <Header title="DIVISION HEAD DASHBOARD" />

      <main className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Complaints Assigned to Your Division</h2>

        {loading && <p className="text-gray-500 text-center">Loading complaints...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {!loading && !error && complaints.length === 0 ? (
          <p className="text-gray-600 text-center mt-4">No complaints assigned to your division yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-300">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Reported By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Room/Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Is Urgent?</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Assigned To (Assignee)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Work Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Completion Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-200">
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-orange-50 transition">
                    <td className="px-4 py-2 whitespace-nowrap text-blue-600 font-medium text-sm">{complaint._id}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.department}</td>
                    <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis">{complaint.description}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.complainant?.name || complaint.reportedBy}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.roomLocation}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      {complaint.isUrgent ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Urgent</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Normal</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">
                      {complaint.assignedTo ? complaint.assignedTo.name : 'Not Assigned'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap capitalize text-sm font-semibold">
                      <span className={
                        complaint.workStatus === 'DONE' ? 'text-green-600' :
                        complaint.workStatus === 'PARTIALLY_DONE' ? 'text-yellow-600' :
                        complaint.workStatus === 'IN_PROGRESS' ? 'text-blue-500' :
                        complaint.workStatus === 'PENDING' ? 'text-orange-500' :
                        'text-red-600' // For CLOSED, REOPENED
                      }>
                        {complaint.workStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis">{complaint.remarks || 'N/A'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{formatDate(complaint.completionDate)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAssignClick(complaint)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 py-1 px-3 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                      >
                        {complaint.assignedTo ? 'Re-assign Assignee' : 'Assign Assignee'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Assign Assignee Modal */}
      <AnimatePresence>
        {showAssignModal && selectedComplaint && (
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
                {selectedComplaint.assignedTo ? 'Re-assign' : 'Assign'} Complaint ID: {selectedComplaint._id} to Assignee
              </h3>
              <p className="mb-2 text-gray-700">Department: {selectedComplaint.department}</p>
              <p className="mb-4 text-gray-700">Description: {selectedComplaint.description}</p>

              <div className="mb-4">
                <label htmlFor="assigneeSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Assignee:
                </label>
                <select
                  id="assigneeSelect"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                >
                  <option value="">-- Select an Assignee --</option>
                  {assignees.map((assignee) => (
                    <option key={assignee._id} value={assignee._id}>
                      {assignee.name} ({assignee.email})
                    </option>
                  ))}
                </select>
              </div>

              {message && (
                <p className={`text-center mb-4 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  {selectedComplaint.assignedTo ? 'Re-assign' : 'Assign'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DivisionHeadDashboard;