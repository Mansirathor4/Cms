// src/pages/coordinatorDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/header';
import formatDate from '../utils/formatDate'; // Import the helper

const CoordinatorDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [divisionHeads, setDivisionHeads] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedDivisionHead, setSelectedDivisionHead] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false); // New state for action modal
  const [actionType, setActionType] = useState(''); // 'reopen' or 'close'
  const [coordinatorRemarks, setCoordinatorRemarks] = useState(''); // Coordinator's remarks for action
  const [message, setMessage] = useState(''); // General message for modals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints for Coordinator:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisionHeads = async () => {
    try {
      // Endpoint to fetch all division heads (assuming this exists in userRoutes.js)
      const res = await axios.get('http://localhost:5000/api/users/division-heads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDivisionHeads(res.data);
    } catch (err) {
      console.error('Failed to fetch division heads:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComplaints();
      fetchDivisionHeads();
    } else {
      setError("No token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  const handleAssignClick = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedDivisionHead(complaint.assignedDivisionHead?._id || '');
    setMessage('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedComplaint || !selectedDivisionHead) {
      setMessage('Please select a complaint and a division head.');
      return;
    }

    try {
      // You need to send the assignedDivision based on the selectedDivisionHead's division.
      // This might require fetching the DH's division first, or having it in the dropdown options.
      // For simplicity, I'll assume a default or you can extend `fetchDivisionHeads` to include division.
      // Or, if the DH has only one division, you can get it from the `User` model.
      const selectedDH = divisionHeads.find(dh => dh._id === selectedDivisionHead);
      const assignedDivision = selectedDH ? selectedDH.division : null; // Assuming DH object has a 'division' field

      const res = await axios.put(
        `http://localhost:5000/api/complaints/assign-division-head/${selectedComplaint._id}`,
        { divisionHeadId: selectedDivisionHead, assignedDivision: assignedDivision || selectedComplaint.department }, // Fallback to complaint department
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || 'Complaint assigned successfully!');
      fetchComplaints(); // Refresh list
      setShowAssignModal(false);
    } catch (err) {
      console.error('Error assigning complaint:', err);
      setMessage('Failed to assign complaint: ' + (err.response?.data?.message || 'Server error.'));
    }
  };

  // New functions for Coordinator actions (Reopen/Close)
  const handleActionClick = (complaint, action) => {
    setSelectedComplaint(complaint);
    setActionType(action);
    setCoordinatorRemarks(complaint.coordinatorRemarks || ''); // Pre-fill if exists
    setMessage('');
    setShowActionModal(true);
  };

  const handleCoordinatorActionSubmit = async () => {
    if (!selectedComplaint || !actionType) {
      setMessage('Invalid action or complaint selected.');
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/complaints/coordinator-action/${selectedComplaint._id}`,
        { action: actionType, coordinatorRemarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || `Complaint ${actionType}ed successfully!`);
      fetchComplaints(); // Refresh complaints
      setShowActionModal(false);
    } catch (err) {
      console.error(`Error ${actionType}ing complaint:`, err);
      setMessage(`Failed to ${actionType} complaint: ` + (err.response?.data?.message || 'Server error.'));
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white"
    >
      <Header title="CENTRAL MAINTENANCE COORDINATOR DASHBOARD" />

      <main className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">All Complaints</h2>

        {loading && <p className="text-gray-500 text-center">Loading complaints...</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {!loading && !error && complaints.length === 0 ? (
          <p className="text-gray-600 text-center mt-4">No complaints in the system.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-300">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Reported By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Assigned DH</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Assignee Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Completion Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">User Feedback</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Feedback Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Coordinator Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-200">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="px-4 py-4 text-center text-gray-500">No complaints found.</td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-orange-50 transition">
                      <td className="px-4 py-2 whitespace-nowrap text-blue-600 font-medium text-sm">{complaint._id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.department}</td>
                      <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis">{complaint.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.complainant?.name || complaint.reportedBy}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.assignedDivisionHead?.name || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.assignedTo?.name || 'N/A'}</td>
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
                      <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis">{complaint.coordinatorRemarks || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAssignClick(complaint)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 py-1 px-3 rounded-md mr-2 mb-1 transition duration-150 ease-in-out"
                        >
                          {complaint.assignedDivisionHead ? 'Re-assign DH' : 'Assign DH'}
                        </button>
                        {/* Conditional Reopen/Close buttons */}
                        {(complaint.workStatus === 'CLOSED_BY_USER' || complaint.workStatus === 'CLOSED_BY_COORDINATOR') && (
                            <button
                              onClick={() => handleActionClick(complaint, 'reopen')}
                              className="text-purple-600 hover:text-purple-900 bg-purple-100 py-1 px-3 rounded-md mr-2 mb-1 transition duration-150 ease-in-out"
                            >
                              Reopen
                            </button>
                        )}
                        {(complaint.workStatus !== 'CLOSED_BY_COORDINATOR' && complaint.workStatus !== 'REOPENED') && (
                            <button
                              onClick={() => handleActionClick(complaint, 'close')}
                              className="text-red-600 hover:text-red-900 bg-red-100 py-1 px-3 rounded-md transition duration-150 ease-in-out"
                            >
                              Close
                            </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Assign Division Head Modal */}
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
              {selectedComplaint.assignedDivisionHead ? 'Re-assign' : 'Assign'} Complaint ID: {selectedComplaint._id} to Division Head
            </h3>
            <p className="mb-2 text-gray-700">Department: {selectedComplaint.department}</p>
            <p className="mb-4 text-gray-700">Description: {selectedComplaint.description}</p>

            <div className="mb-4">
              <label htmlFor="divisionHeadSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Division Head:
              </label>
              <select
                id="divisionHeadSelect"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedDivisionHead}
                onChange={(e) => setSelectedDivisionHead(e.target.value)}
              >
                <option value="">-- Select Division Head --</option>
                {divisionHeads.map((dh) => (
                  <option key={dh._id} value={dh._id}>
                    {dh.name} ({dh.email})
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
                {selectedComplaint.assignedDivisionHead ? 'Re-assign' : 'Assign'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Coordinator Action Modal (Reopen/Close) */}
      <AnimatePresence>
        {showActionModal && selectedComplaint && (
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
                {actionType === 'reopen' ? 'Reopen' : 'Close'} Complaint ID: {selectedComplaint._id}
              </h3>
              <p className="mb-2 text-gray-700">Current Status: <span className="font-semibold capitalize">{selectedComplaint.workStatus.replace('_', ' ')}</span></p>
              <p className="mb-4 text-gray-700">Description: {selectedComplaint.description}</p>

              <div className="mb-4">
                <label htmlFor="coordinatorRemarks" className="block text-sm font-medium text-gray-700 mb-2">
                  Coordinator Remarks:
                </label>
                <textarea
                  id="coordinatorRemarks"
                  rows="3"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={coordinatorRemarks}
                  onChange={(e) => setCoordinatorRemarks(e.target.value)}
                  placeholder="Add remarks for this action..."
                ></textarea>
              </div>

              {message && (
                <p className={`text-center mb-4 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCoordinatorActionSubmit}
                  className={`px-4 py-2 rounded-md transition ${
                    actionType === 'reopen' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                    'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {actionType === 'reopen' ? 'Reopen Complaint' : 'Close Complaint'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CoordinatorDashboard;