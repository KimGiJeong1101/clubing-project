import React from "react";

const CustomCheckbox = ({ label, checked, onChange, className = "", ...props }) => (
  <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-gray-300 accent-[#6E3C21] cursor-pointer focus:ring-2 focus:ring-[#6E3C21]/30"
      {...props}
    />
    {label && <span className="text-sm text-gray-700 select-none">{label}</span>}
  </label>
);

export default CustomCheckbox;
