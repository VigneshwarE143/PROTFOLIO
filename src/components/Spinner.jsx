import React from "react";

const Spinner = ({ label = "Loading..." }) => (
  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
    <span className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default Spinner;
