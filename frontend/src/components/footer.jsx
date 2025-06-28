import React from "react";

const Footer = () => {
  return (
    <footer className="bg-orange-100 text-center text-sm text-gray-700 py-3 border-t border-orange-200 w-full">
      <div className="container mx-auto px-4">
        <p>
          &copy; {new Date().getFullYear()} THDC Institute of Hydropower Engineering and Technology, Tehri. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
