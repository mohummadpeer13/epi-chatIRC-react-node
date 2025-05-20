import React from 'react';

const Snackbar = ({ message, severity, onClose }) => {
  return (
    <div
      className={`fixed top-5 right-5 p-4 rounded shadow-lg text-white ${severity === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
    >
      {message}
      <button
        className="ml-4 font-bold text-white"
        onClick={onClose}
      >
        ✖
      </button>
    </div>
  );
};

export default Snackbar;
