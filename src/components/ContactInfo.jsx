import React from "react";

const ContactInfo = ({ Icon, text, href, title }) => (
  <div className="flex items-start gap-4">
    <span className="text-teal-600 dark:text-teal-400">
      <Icon className="w-5 h-5" />
    </span>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <a
        href={href}
        className="text-gray-900 dark:text-white hover:text-teal-600 transition duration-200 break-words"
        target={title === "Email" || title === "Phone" ? "_self" : "_blank"}
        rel="noopener noreferrer"
      >
        {text}
      </a>
    </div>
  </div>
);

export default ContactInfo;
