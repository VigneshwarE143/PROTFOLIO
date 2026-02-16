import React from "react";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";

const ProjectCard = ({ project }) => (
  <div className="bg-white/95 dark:bg-slate-900/80 p-7 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700/70 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl animate-fade-up">
    <div className="flex items-start justify-between gap-4">
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {project.title}
      </h3>
      <span className="text-teal-500">
        <FaGithub className="w-5 h-5" />
      </span>
    </div>
    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-3">
      {project.description}
    </p>

    <div className="flex flex-wrap gap-2 mt-5">
      {project.tech.map((tag, i) => (
        <span
          key={i}
          className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-300"
        >
          {tag}
        </span>
      ))}
    </div>

    <div className="mt-6 flex items-center gap-4">
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-800 dark:hover:text-teal-200 transition"
      >
        <FaExternalLinkAlt className="w-4 h-4 mr-2" /> View Repository
      </a>
    </div>
  </div>
);

export default ProjectCard;
