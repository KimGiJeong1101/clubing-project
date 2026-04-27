import React from "react";

const CustomButton2 = ({ children, className = "", type = "button", ...props }) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-nanum-bold
      bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200 cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default CustomButton2;
