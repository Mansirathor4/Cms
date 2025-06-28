import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Home from "./pages/hero";
import Signup from "./components/signup";
import UserDashboard from "./pages/userDashboard";
import CoordinatorDashboard from "./pages/coordinatorDashboard";
import DivisionHeadDashboard from "./pages/divisonHeadDashboard";
import AssigneeDashboard from "./pages/assigneeDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/dashboard/divisionHead" element={<DivisionHeadDashboard />} />
        <Route path="/dashboard/assignee" element={<AssigneeDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
