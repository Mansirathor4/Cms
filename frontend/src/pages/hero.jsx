import React from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/campus.png"; 
import logo from "../assets/logo.webp";
import Footer from "../components/footer";

const Hero = () => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Left Image Section */}
        <div className="md:w-1/2 h-64 md:h-full">
          <img src={heroImage} alt="College" className="w-full h-full object-cover" />
        </div>

        {/* Right Content Section */}
        <div className="md:w-1/2 flex flex-col justify-center items-center bg-orange-50">
          <div className="text-center max-w-xl">
            <img src={logo} alt="Institute Logo" className="w-24 h-24 mx-auto mb-4" />

            <h3 className="text-base md:text-md text-blue-900 font-medium leading-snug mb-4">
              Veer Madho Singh Bhandari Uttarakhand Technical University Campus Institute<br />
              टीएचडीसी इंस्टीट्यूट ऑफ हाइड्रोपावर अभियांत्रिकी एवं प्रौद्योगिकी संस्थान, टिहरी, उत्तराखंड<br />
              THDC Institute of Hydropower Engineering and Technology, Tehri, Uttarakhand
            </h3>

            <h1 className="text-2xl md:text-3xl font-bold text-orange-600 mb-6 py-5">
              COMPLAINT MANAGEMENT SYSTEM
            </h1>

            {/* Card with Actions */}
            <div className="bg-white p-10 rounded-xl shadow-lg border border-orange-600 w-[60%] max-w-md mx-auto">
              <p className="mb-3 text-md font-semibold text-blue-900">New User</p>
              <Link to="/signup">
                <button className="w-[6em] bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-2 rounded-lg mb-4 transition duration-200">
                  Sign Up
                </button>
              </Link>

              <p className="mb-3 text-md font-semibold text-blue-900">Already a User?</p>
              <Link to="/login">
                <button className="w-[6em] bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-2 rounded-lg mb-4 transition duration-200">
                  Log In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Hero;
