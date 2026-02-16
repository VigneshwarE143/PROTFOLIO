import React from "react";

const SectionTitle = ({ children, subtitle }) => (
  <div className="mb-10">
    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 inline-flex items-center gap-3">
      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow" />
      {children}
    </h2>
    {subtitle && (
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionTitle;
