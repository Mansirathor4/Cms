import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/header';

const AssigneeDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // Complaint being updated
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Modal visibility
  const [workStatus, setWorkStatus] = useState(''); // Status for update
  const [remarks, setRemarks] = useState(''); // Remarks for update
  const [updateMessage, setUpdateMessage] = useState(''); // Feedback message for update
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // --- Fetch Complaints Assigned to this Assignee ---
  const fetchAssignedComplaints = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/assigned', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setError('Failed to load complaints. Please ensure you are logged in and the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("You are not logged in. Please log in to view assigned complaints.");
      setLoading(false);
      return;
    }
    fetchAssignedComplaints();
  }, [token]);

  // --- Handle 'Update Work' button click ---
  const handleUpdateClick = (complaint) => {
    setSelectedComplaint(complaint);
    setWorkStatus(complaint.workStatus);
    setRemarks(complaint.remarks || '');
    setUpdateMessage(''); // Clear any previous update messages when opening the modal
    setShowUpdateModal(true);
  };

  // --- Handle Work Status Update Submission ---
  const handleUpdateSubmit = async () => {
    if (!selectedComplaint) {
      setUpdateMessage('No complaint selected for update.');
      return;
    }

    // Determine the completionDate to send based on workStatus
    // We send a specific value: current date (iso string) for DONE/PARTIALLY_DONE
    // or null for IN_PROGRESS. Backend will handle the actual date setting.
    let dateToSet = null;
    if (workStatus === 'DONE' || workStatus === 'PARTIALLY_DONE') {
      dateToSet = new Date().toISOString(); // Send current time to backend
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/complaints/update-work-status/${selectedComplaint._id}`,
        {
          workStatus,
          remarks,
          completionDate: dateToSet, // Send the determined date/null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpdateMessage(response.data.message || 'Complaint updated successfully!');
      fetchAssignedComplaints(); // Refresh complaints to see the changes
      // Automatically close modal after a short delay for success message visibility
      setTimeout(() => {
        setShowUpdateModal(false);
        setSelectedComplaint(null); // Clear selected complaint
      }, 1500);
    } catch (err) {
      console.error('Error updating complaint work status:', err);
      setUpdateMessage('Failed to update complaint. ' + (err.response?.data?.message || 'Please try again.'));
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white"
    >
      <Header title="ASSIGNEE DASHBOARD" />

      <main className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-extrabold text-blue-800 mb-6 border-b-2 border-blue-200 pb-2">Your Assigned Complaints</h2>

        {loading && <p className="text-blue-500 text-center text-lg mt-8">Loading your assigned complaints...</p>}
        {error && <p className="text-red-600 text-center text-lg mt-8 font-semibold">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-300">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Reported By</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Urgency</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Completion Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-200">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500 text-lg">
                      No complaints assigned to you at the moment.
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-orange-50 transition">
                      <td className="px-4 py-2 whitespace-nowrap text-blue-600 font-semibold text-sm">{complaint._id.substring(0, 8)}...</td> {/* Truncate ID */}
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.department}</td>
                      <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis" title={complaint.description}>{complaint.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.complainant?.name || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{complaint.roomLocation}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {complaint.isUrgent ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Urgent</span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Normal</span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap capitalize text-sm font-bold">
                        <span className={
                          complaint.workStatus === 'DONE' ? 'text-green-600' :
                          complaint.workStatus === 'PARTIALLY_DONE' ? 'text-yellow-600' : 'text-red-600'
                        }>
                          {complaint.workStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-800 text-sm max-w-xs overflow-hidden text-ellipsis" title={complaint.remarks}>{complaint.remarks || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-sm">{formatDate(complaint.completionDate)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => handleUpdateClick(complaint)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 py-1 px-3 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm"
                        >
                          Update Work
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Update Work Status Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedComplaint && (
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
              className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300"
            >
              <h3 className="text-2xl font-bold text-blue-700 mb-5 text-center">
                Update Work Status
              </h3>
              <p className="mb-2 text-gray-700">
                <span className="font-semibold">Complaint ID:</span> {selectedComplaint._id}
              </p>
              <p className="mb-2 text-gray-700">
                <span className="font-semibold">Department:</span> {selectedComplaint.department}
              </p>
              <p className="mb-4 text-gray-700">
                <span className="font-semibold">Description:</span> {selectedComplaint.description}
              </p>

              <div className="mb-4">
                <label htmlFor="workStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Status:
                </label>
                <select
                  id="workStatus"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  value={workStatus}
                  onChange={(e) => setWorkStatus(e.target.value)}
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PARTIALLY_DONE">Partially Done</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks:
                </label>
                <textarea
                  id="remarks"
                  rows="3"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any relevant remarks about the work..."
                ></textarea>
              </div>

              {updateMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center mb-4 text-sm font-medium ${updateMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}
                >
                  {updateMessage}
                </motion.p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedComplaint(null); // Clear selected complaint on cancel
                  }}
                  className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                >
                  Submit Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssigneeDashboard;