import React from "react";
import logo from "../assets/logo.webp";
import UserProfile from "./userProfile"; // Import the UserProfile component

const Header = ({ title }) => {
  return (
    <header className="w-full bg-orange-50 border-b border-orange-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Row with Logo and Institute Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 text-center mb-4 md:mb-0 bg-orange-50 border-b border-orange-200 py-3">
          <div className="flex flex-col md:flex-row items-center space-x-4">
            <img src={logo} alt="Institute Logo" className="w-16 h-16 flex-shrink-0" />
            <div className="text-sm md:text-base text-blue-900 font-medium leading-snug text-center">
              Veer Madho Singh Bhandari Uttarakhand Technical University Campus Institute<br />
              टीएचडीसी इंस्टीट्यूट ऑफ हाइड्रोपावर अभियांत्रिकी एवं प्रौद्योगिकी संस्थान, टिहरी, उत्तराखंड<br />
              THDC Institute of Hydropower Engineering and Technology, Tehri, Uttarakhand
            </div>
          </div>
        </div>

        {/* Dynamic Page Title and Profile Section */}
        <div className="flex flex-col md:flex-row pt-4">
          <h1 className="text-xl md:text-2xl font-bold text-orange-600 uppercase mb-4 md:mb-0 md:text-center text-center flex-grow">
            {title}
          </h1>
          <div className="ml-auto"> {/* This will push the UserProfile to the right */}
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;