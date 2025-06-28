import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence for exit animations

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [showDetails, setShowDetails] = useState(false); // New state to toggle details visibility

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUserProfile(res.data);
      setProfileError('');
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setProfileError('Failed to load profile.');
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (loadingProfile) {
    return (
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold cursor-pointer animate-pulse">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="relative group">
        <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold cursor-pointer">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="absolute right-0 mt-2 p-3 bg-white border border-red-300 rounded-lg shadow-lg text-red-700 text-sm z-10 w-48 hidden group-hover:block">
            {profileError}
        </div>
      </div>
    );
  }

  if (!userProfile) {
      return null; // Or some fallback UI if no profile is found after loading
  }

  // Display the user's initial or first two letters of their name for the icon
  const getInitials = (name) => {
    if (!name) return 'U'; // Default to 'U' for User if name is not available
    const parts = name.split(' ').filter(Boolean); // Split by space and remove empty strings
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };


  return (
    <div className="relative">
      {/* Profile Icon */}
      <div
        className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold cursor-pointer shadow-md hover:bg-blue-600 transition duration-200"
        onClick={toggleDetails}
      >
        {/* You can replace this SVG with an icon from react-icons (e.g., <FaUserCircle />) */}
        {userProfile.name ? (
            getInitials(userProfile.name)
        ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )}
      </div>

      {/* Profile Details (Conditionally rendered) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white border border-blue-200 rounded-lg shadow-xl p-5 z-20"
          >
            <h3 className="text-xl font-bold text-blue-700 mb-3 border-b pb-2">Your Profile</h3>
            <div className="space-y-2 text-gray-700">
              <p><strong>User ID:</strong> {userProfile.userId}</p>
              <p><strong>Name:</strong> {userProfile.name}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Role:</strong> {userProfile.role}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;