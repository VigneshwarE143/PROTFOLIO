import React from "react";
import { ChevronsRight, Code } from "lucide-react";

const SkillCard = ({ skillGroup }) => (
  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg transition duration-300 transform hover:shadow-2xl hover:-translate-y-1 border border-transparent hover:border-teal-500 animate-fade-up">
    <h3 className="flex items-center text-xl font-bold text-teal-600 dark:text-teal-400 mb-4">
      <Code className="w-6 h-6 mr-2" /> {skillGroup.category}
    </h3>
    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
      {skillGroup.list.map((skill, i) => (
        <li key={i} className="flex items-center text-base">
          <ChevronsRight className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
          {skill}
        </li>
      ))}
    </ul>
  </div>
);

export default SkillCard;
