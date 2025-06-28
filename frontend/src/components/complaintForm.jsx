import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const ComplaintForm = () => {
  const [form, setForm] = useState({
    department: "",
    reportedBy: "",
    dispatchNo: "",
    requestedBy: "",
    date: "",
    roomLocation: "",
    description: "",
    isUrgent: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/complaints", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSuccess("Complaint submitted successfully!");
      setForm({
        department: "",
        reportedBy: "",
        dispatchNo: "",
        requestedBy: "",
        date: "",
        roomLocation: "",
        description: "",
        isUrgent: false,
      });
      if (onSuccess) onSuccess(); // Refresh complaints in dashboard
    } catch (err) {
      setError("Failed to submit complaint");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white flex items-center justify-center px-4"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-orange-50 p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center">
          Complaint Form
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Department (विभाग)
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Department --</option>
              <option value="Computer">CSE (Computer Science)</option>
              <option value="Electronics">ECE (Electronics)</option>
              <option value="Mechanical">ME (Mechanical)</option>
              <option value="Civil">CE (Civil)</option>
              <option value="Electrical">EE (Electrical)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Reported By (रिपोर्ट करने वाला)
            </label>
            <input
              name="reportedBy"
              onChange={handleChange}
              className="w-full p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Dispatch No (डिस्पैच नंबर)
            </label>
            <input
              name="dispatchNo"
              onChange={handleChange}
              className="w-full p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Requested By (अनुरोध करने वाला)
            </label>
            <input
              name="requestedBy"
              onChange={handleChange}
              className="w-full p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Date (तारीख)
            </label>
            <input
              type="date"
              name="date"
              onChange={handleChange}
              className="w-full p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Room No/Location (कक्ष संख्या/स्थान)
            </label>
            <input
              name="roomLocation"
              onChange={handleChange}
              className="w-full p-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-semibold text-gray-700 mb-1">
            Problem Description (समस्या का विवरण)
          </label>
          <textarea
            name="description"
            onChange={handleChange}
            className="w-full p-3 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        <div className="mt-4 flex items-center space-x-3">
          <input
            type="checkbox"
            name="isUrgent"
            onChange={handleChange}
            className="accent-blue-600 w-5 h-5"
          />
          <label className="text-sm font-medium text-gray-700">
            Mark as <span className="font-bold text-red-600">URGENT</span>{" "}
            (जरूरी चिन्हित करें)
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl transition duration-300"
        >
          Submit Complaint
        </button>
      </form>
    </motion.div>
  );
};

export default ComplaintForm;
