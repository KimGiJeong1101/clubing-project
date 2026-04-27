import React from "react";

const RowsPerPageSelector = ({ rowsPerPage, setRowsPerPage }) => {
  const options = [3, 5, 10, 25];

  return (
    <div className="flex gap-1.5">
      {options.map((option) => (
        <button key={option} onClick={() => setRowsPerPage(option)} className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${rowsPerPage === option ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          {option}
        </button>
      ))}
    </div>
  );
};

export default RowsPerPageSelector;
