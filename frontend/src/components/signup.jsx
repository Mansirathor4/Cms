import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      setMessage("Signup successful! Check your email for User ID.");
    } catch (err) {
      setMessage("Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-orange-50 rounded-2xl shadow-md"
      >
        <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
          Sign Up
        </h2>
        {message && <p className="text-center text-blue-600">{message}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">Complainant</option>
            <option value="coordinator">Coordinator</option>
            <option value="divisionHead">Division Head</option>
            <option value="assignee">Assignee</option>
          </select>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-xl transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
