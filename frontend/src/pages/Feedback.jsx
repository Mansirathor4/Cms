import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState('');
  const [feedback, setFeedback] = useState({
    workCompletelySatisfied: false,
    partiallySatisfied: false,
    notSatisfied: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/complaints/user-feedback-pending')
      .then((res) => setComplaints(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFeedback({
      workCompletelySatisfied: false,
      partiallySatisfied: false,
      notSatisfied: false,
      [name]: checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaintId) return alert('Please select a complaint');

    try {
      await axios.put(`/api/complaints/feedback/${selectedComplaintId}`, feedback);
      alert('Feedback submitted');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error submitting feedback');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Submit Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={selectedComplaintId}
          onChange={(e) => setSelectedComplaintId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Complaint</option>
          {complaints.map((c) => (
            <option key={c._id} value={c._id}>
              {c.description} - {c.workStatus}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-2">
          <label>
            <input
              type="checkbox"
              name="workCompletelySatisfied"
              checked={feedback.workCompletelySatisfied}
              onChange={handleChange}
            />{' '}
            Completely Satisfied
          </label>

          <label>
            <input
              type="checkbox"
              name="partiallySatisfied"
              checked={feedback.partiallySatisfied}
              onChange={handleChange}
            />{' '}
            Partially Satisfied
          </label>

          <label>
            <input
              type="checkbox"
              name="notSatisfied"
              checked={feedback.notSatisfied}
              onChange={handleChange}
            />{' '}
            Not Satisfied
          </label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
