import { personalData } from "../data/portfolioData";

export const getFeaturedProjects = async () => {
  return { projects: personalData.projects, error: null, usedFallback: false };
};
