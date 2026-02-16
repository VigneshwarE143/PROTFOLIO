import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import emailjs from "emailjs-com";
import {
  Menu,
  X,
  Sun,
  Moon,
  Mail,
  Home,
  User,
  Briefcase,
  Code,
  School,
  Phone,
  ChevronUp,
  Send,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaArrowRight,
} from "react-icons/fa";

import { personalData } from "../data/portfolioData";
import { getFeaturedProjects } from "../services/portfolioService";
import SectionTitle from "../components/SectionTitle";
import ProjectCard from "../components/ProjectCard";
import SkillCard from "../components/SkillCard";
import Spinner from "../components/Spinner";
import ContactInfo from "../components/ContactInfo";
import Divider from "../components/Divider";

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) return storedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
};

const useIntersectionObserver = (refs) => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    let ticking = false;

    const updateActive = () => {
      ticking = false;
      const anchor = window.innerHeight * 0.35;

      let currentId = activeSection;
      for (const ref of refs) {
        const el = ref.current;
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor && rect.bottom >= anchor) {
          currentId = el.id;
          break;
        }
      }

      if (currentId !== activeSection) {
        setActiveSection(currentId);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActive);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateActive();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [refs, activeSection]);

  return activeSection;
};

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      setToast({ message, type });

      setTimeout(() => {
        setToast(null);
      }, duration);
    },
    [],
  );

  return { toast, showToast };
};

const Toast = ({ toast }) => {
  if (!toast) return null;

  const { message, type } = toast;
  const styleMap = {
    success: { bg: "bg-teal-500", text: "text-white", Icon: Check },
    error: { bg: "bg-red-500", text: "text-white", Icon: X },
    warning: {
      bg: "bg-yellow-500",
      text: "text-gray-900",
      Icon: AlertTriangle,
    },
  };

  const { bg, text, Icon } = styleMap[type] || styleMap.warning;

  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl transition-all duration-300 transform ${bg} ${text} z-[100]`}
      style={{ minWidth: "300px" }}
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-3" />
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
};

const SocialLink = ({ Icon, href, username, isSidebar = false }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={username}
    className={`p-2 rounded-full transition duration-300 
      ${
        isSidebar
          ? "text-gray-400 hover:bg-teal-600 hover:text-white"
          : "text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200"
      }
      hover:scale-110`}
  >
    <Icon className="w-5 h-5" />
  </a>
);

const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { toast, showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const projectsRef = useRef(null);
  const educationRef = useRef(null);
  const contactRef = useRef(null);

  const sectionRefs = useMemo(
    () => [homeRef, aboutRef, skillsRef, projectsRef, educationRef, contactRef],
    [],
  );
  const activeSection = useIntersectionObserver(sectionRefs, 0.5);

  const navItems = useMemo(
    () => [
      { name: "Home", icon: Home, ref: homeRef, id: "home" },
      { name: "About", icon: User, ref: aboutRef, id: "about" },
      { name: "Skills", icon: Code, ref: skillsRef, id: "skills" },
      { name: "Projects", icon: Briefcase, ref: projectsRef, id: "projects" },
      { name: "Education", icon: School, ref: educationRef, id: "education" },
      { name: "Contact", icon: Mail, ref: contactRef, id: "contact" },
    ],
    [],
  );

  const scrollToSection = useCallback((ref) => {
    if (ref.current) {
      const offset = window.innerWidth >= 768 ? 0 : 90;
      window.scrollTo({
        top: ref.current.offsetTop - offset,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  }, []);

  const handleScroll = () => {
    setShowScrollToTop(window.scrollY > 500);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setProjectsLoading(true);
      const result = await getFeaturedProjects();
      if (!isMounted) return;
      setProjects(result.projects);
      setProjectsError(result.error);
      setUsingFallback(result.usedFallback);
      setProjectsLoading(false);
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const NavLink = ({ item, isSidebar = false }) => {
    const isActive = activeSection === item.id;
    const baseClasses =
      "flex items-center w-full py-2 px-3 transition-all duration-200 rounded-xl font-medium";
    const activeClasses = isSidebar
      ? "bg-teal-600 text-white shadow-lg"
      : "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300";
    const inactiveClasses = isSidebar
      ? "text-gray-600 dark:text-gray-400 hover:bg-teal-50 hover:dark:bg-gray-800"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800";

    return (
      <button
        onClick={() => scrollToSection(item.ref)}
        className={`${baseClasses} ${
          isActive ? activeClasses : inactiveClasses
        } ${isSidebar ? "justify-start" : "justify-start"}`}
      >
        <item.icon className="w-5 h-5 mr-3" />
        {item.name}
      </button>
    );
  };

  const ThemeToggle = ({ isSidebar = false }) => {
    const Icon = theme === "light" ? Moon : Sun;
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Toggle to ${theme === "light" ? "Dark" : "Light"} Mode`}
        className={`p-2 rounded-full transition duration-300 
          ${
            isSidebar
              ? "text-gray-600 dark:text-gray-400 hover:bg-teal-600 hover:text-white"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };

  const Sidebar = () => (
    <aside className="hidden md:flex flex-col w-72 fixed h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-xl p-6 z-50">
      <div className="flex flex-col flex-grow">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          {personalData.fullName.split(" ")[0]}
          <span className="text-teal-600 dark:text-teal-400 ml-1">
            {personalData.fullName.split(" ")[1]}
          </span>
        </h1>

        <nav className="space-y-2 flex-grow">
          {navItems.map((item) => (
            <NavLink key={item.id} item={item} isSidebar={true} />
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-around mb-4">
            <SocialLink
              Icon={FaGithub}
              username="GitHub"
              href={`https://github.com/${personalData.github}`}
              isSidebar={true}
            />
            <SocialLink
              Icon={FaLinkedin}
              username="LinkedIn"
              href={personalData.linkedin}
              isSidebar={true}
            />
            <ThemeToggle isSidebar={true} />
          </div>
          <p className="text-xs text-center text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()}{" "}
            {personalData.fullName.split(" ")[0]}
          </p>
        </div>
      </div>
    </aside>
  );

  const MobileNavbar = () => (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center h-16 px-4">
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
          {personalData.fullName.split(" ")[0]}
          <span className="text-teal-600 dark:text-teal-400 ml-1">
            {personalData.fullName.split(" ")[1]}
          </span>
        </h1>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100 p-4" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.id} item={item} isSidebar={false} />
          ))}
        </nav>
        <div className="flex justify-center space-x-6 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
          <SocialLink
            Icon={FaGithub}
            username="GitHub"
            href={`https://github.com/${personalData.github}`}
          />
          <SocialLink
            Icon={FaLinkedin}
            username="LinkedIn"
            href={personalData.linkedin}
          />
        </div>
      </div>
    </header>
  );

  const HeroSection = () => (
    <section
      id="home"
      ref={homeRef}
      className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-teal-400/15 blur-3xl animate-blob" />
        <div className="absolute top-10 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-blob-slow" />
        <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl animate-blob" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 relative z-10 w-full">
        <div className="bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white rounded-[2.75rem] shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-10 sm:p-14 lg:p-16 backdrop-blur">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300/90 font-semibold mb-3 animate-fade-up delay-100">
                Hello, It's Me
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight animate-fade-up delay-200">
                {personalData.fullName}
              </h1>
              <h2 className="text-xl sm:text-2xl font-semibold text-teal-600 dark:text-teal-300 mt-3 animate-fade-up delay-300">
                {personalData.role}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-4 animate-fade-up delay-300">
                <FaMapMarkerAlt className="text-teal-600 dark:text-teal-300" />
                <span>{personalData.location}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 mt-6 leading-relaxed animate-fade-up delay-400">
                {personalData.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-8 animate-fade-up delay-500">
                <a
                  href={personalData.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-full shadow-lg text-white bg-teal-600 hover:bg-teal-500 dark:text-slate-900 dark:bg-teal-300 dark:hover:bg-teal-200 transition duration-300"
                >
                  Download CV <FaArrowRight className="w-4 h-4 ml-2" />
                </a>
                <div className="flex items-center gap-3">
                  <SocialLink
                    Icon={FaGithub}
                    username="GitHub"
                    href={`https://github.com/${personalData.github}`}
                  />
                  <SocialLink
                    Icon={FaLinkedin}
                    username="LinkedIn"
                    href={personalData.linkedin}
                  />
                  <SocialLink
                    Icon={FaArrowRight}
                    username="Email"
                    href={`mailto:${personalData.email}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-[22rem] lg:h-[22rem]">
                <div className="absolute inset-0 hexagon bg-teal-400/30 blur-2xl animate-blob hero-glow" />
                <div className="absolute inset-0 hexagon bg-teal-500/90 hero-glow" />
                <div className="absolute inset-[10px] hexagon bg-white dark:bg-slate-900">
                  <img
                    src="/portrait.png"
                    alt={`${personalData.fullName}'s profile`}
                    className="w-full h-full object-cover hexagon scale-[1.08]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/260x260/0f172a/ffffff?text=V.E";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const AboutSection = () => (
    <section
      id="about"
      ref={aboutRef}
      className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-500 relative"
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <SectionTitle subtitle="A quick snapshot of my focus, values, and strengths.">
          About Me
        </SectionTitle>
        <div className="mt-6 space-y-6 text-base sm:text-lg text-gray-700 dark:text-gray-300">
          <p className="animate-fade-up delay-100">
            I am a Full Stack Developer with strong expertise in building
            scalable and secure web applications using Java, Spring Boot, MySQL,
            and React. I specialize in designing robust backend systems,
            developing RESTful APIs, and integrating responsive frontend
            interfaces to create complete, production-ready applications.
          </p>
          <p className="animate-fade-up delay-200">
            With a background in Artificial Intelligence and Data Science, I
            bring an analytical and data-driven approach to software
            development. I have foundational knowledge of machine learning
            concepts, data processing, and model integration, which allows me to
            design applications that can leverage intelligent features and
            data-informed functionality.
          </p>
          <p className="animate-fade-up delay-300">
            I have hands-on experience developing full-stack projects with
            secure authentication, role-based access control, and efficient
            database design. I focus on writing clean, maintainable code and
            building systems that are scalable, reliable, and aligned with
            modern software engineering practices.
          </p>
          <p className="animate-fade-up delay-400">
            I am passionate about continuously learning new technologies,
            improving my system design skills, and contributing to real-world
            projects where I can combine full-stack development with
            intelligent, data-driven solutions.
          </p>
        </div>
      </div>
    </section>
  );

  const SkillsSection = () => (
    <section
      id="skills"
      ref={skillsRef}
      className="py-20 sm:py-24 bg-white dark:bg-gray-900 transition-colors duration-500 relative"
    >
      <div className="absolute inset-0 bg-shimmer opacity-50 pointer-events-none" />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <SectionTitle subtitle="Tooling, frameworks, and platforms I work with.">
          Skills & Tech Stack
        </SectionTitle>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {personalData.skills.map((skillGroup, index) => (
            <SkillCard key={index} skillGroup={skillGroup} />
          ))}
        </div>
      </div>
    </section>
  );

  const ProjectsSection = () => (
    <section
      id="projects"
      ref={projectsRef}
      className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-500 relative"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 right-10 w-56 h-56 rounded-full bg-teal-500/10 blur-2xl animate-blob" />
      </div>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <SectionTitle subtitle="Highlighted builds that showcase backend and full-stack expertise.">
          Featured Projects
        </SectionTitle>

        {projectsLoading && (
          <div className="mt-6 animate-fade-up delay-100">
            <Spinner label="Loading featured projects" />
          </div>
        )}

        {!projectsLoading && projectsError && (
          <div className="mt-6 p-4 rounded-xl bg-yellow-50 text-yellow-800 border border-yellow-200 animate-fade-up delay-100">
            {projectsError} Showing cached projects.
          </div>
        )}

        {!projectsLoading && !projects.length && (
          <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 animate-fade-up delay-100">
            No projects available yet. Please check back soon.
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>

        {usingFallback && !projectsLoading && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            API unavailable. Showing local portfolio data.
          </p>
        )}
      </div>
    </section>
  );

  const EducationSection = () => (
    <section
      id="education"
      ref={educationRef}
      className="py-20 sm:py-24 bg-white dark:bg-gray-900 transition-colors duration-500 relative"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl animate-blob-slow" />
      </div>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <SectionTitle subtitle="Academic milestones that shaped my foundation.">
          Education
        </SectionTitle>

        <div className="mt-6 space-y-6">
          {personalData.education.map((edu, index) => (
            <div
              key={index}
              className="relative pl-10 border-l-4 border-teal-300 dark:border-teal-700"
            >
              <span className="absolute -left-3 top-0 p-1 rounded-full bg-teal-600 dark:bg-teal-400 text-white shadow-md">
                <School className="w-5 h-5" />
              </span>
              <div className="rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700/70 p-5 shadow-sm animate-fade-up">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {edu.type}
                </h3>
                <p className="text-base sm:text-lg text-teal-600 dark:text-teal-400 font-medium mb-1">
                  {edu.institution}
                </p>
                <p className="text-gray-600 dark:text-gray-400 italic">
                  {edu.details}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">
                  {edu.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const ContactSection = () => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!form.name || !form.email || !form.message) {
        showToast("Please fill all required fields.", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }

      const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
      const bodyText = `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`;
      const body = encodeURIComponent(bodyText);
      const mailtoLink = `mailto:${personalData.email}?subject=${subject}&body=${body}`;

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        try {
          const templateParams = {
            from_name: form.name,
            from_email: form.email,
            message: form.message,
            subject: `Portfolio Contact from ${form.name}`,
          };
          await emailjs.send(serviceId, templateId, templateParams, publicKey);
          showToast(
            "Message sent successfully via EmailJS. Thank you!",
            "success",
          );
          setForm({ name: "", email: "", message: "" });
          return;
        } catch (emailErr) {
          console.error("EmailJS send error:", emailErr);
        }
      }

      try {
        const a = document.createElement("a");
        a.href = mailtoLink;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast(
          "Email client opened. You may need to press Send.",
          "success",
        );
        setForm({ name: "", email: "", message: "" });
        return;
      } catch (err) {
        // fallthrough to clipboard fallback
      }

      const clipboardText = `${personalData.email}\n\nSubject: Portfolio Contact from ${form.name}\n\n${bodyText}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(clipboardText);
          showToast(
            "Could not open mail client — message copied to clipboard. Paste into your email composer.",
            "warning",
          );
          setForm({ name: "", email: "", message: "" });
          return;
        } catch (copyErr) {
          showToast(
            "Unable to open email client or copy to clipboard. Please contact: " +
              personalData.email,
            "error",
          );
          return;
        }
      }

      showToast(
        "Unable to open email client. Please send your message to " +
          personalData.email,
        "error",
      );
    };

    const displayName = "Vigneshwar E";

    return (
      <section
        id="contact"
        ref={contactRef}
        className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-500 relative"
      >
        <div className="absolute inset-0 bg-shimmer opacity-40 pointer-events-none" />
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <SectionTitle subtitle="Let’s build something great together.">
            Get In Touch
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
            <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Send a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email *"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500 transition"
                ></textarea>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center py-3 text-lg font-bold rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 transition duration-300 transform hover:-translate-y-0.5"
                  >
                    <Send className="w-5 h-5 mr-2" /> Send Message
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const text = `To: ${personalData.email}\nSubject: Portfolio Contact from ${form.name}\n\n${form.message || ""}`;
                      if (
                        navigator.clipboard &&
                        navigator.clipboard.writeText
                      ) {
                        try {
                          await navigator.clipboard.writeText(text);
                          showToast(
                            "Message copied to clipboard. Paste into your email client.",
                            "success",
                          );
                          setForm({
                            name: form.name,
                            email: form.email,
                            message: form.message,
                          });
                        } catch (err) {
                          showToast(
                            "Unable to copy to clipboard. Please copy manually.",
                            "error",
                          );
                        }
                      } else {
                        showToast(
                          "Clipboard not available. Please copy manually.",
                          "error",
                        );
                      }
                    }}
                    className="flex-none px-4 py-3 text-lg font-bold rounded-xl shadow-inner text-teal-600 border-2 border-teal-600 bg-white dark:bg-gray-900 hover:bg-teal-50 transition duration-300"
                  >
                    Copy
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Contact Details
              </h3>

              <ContactInfo
                Icon={Mail}
                title="Email"
                text={personalData.email}
                href={`mailto:${personalData.email}`}
              />
              <ContactInfo
                Icon={Phone}
                title="Phone"
                text={personalData.phone}
                href={`tel:${personalData.phone.replace(/\s/g, "")}`}
              />
              <ContactInfo
                Icon={FaLinkedin}
                title="LinkedIn"
                text={displayName}
                href={personalData.linkedin}
              />
              <ContactInfo
                Icon={FaGithub}
                title="GitHub"
                text={displayName}
                href={`https://github.com/${personalData.github}`}
              />
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen font-sans ${theme}`}>
      <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
        <Sidebar />
        <MobileNavbar />

        <main className="flex-1 md:pl-80 pt-16 md:pt-0 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl animate-blob" />
            <div className="absolute bottom-20 right-1/3 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-blob-slow" />
          </div>
          <HeroSection />
          <Divider />
          <AboutSection />
          <Divider />
          <SkillsSection />
          <Divider />
          <ProjectsSection />
          <Divider />
          <EducationSection />
          <Divider />
          <ContactSection />
        </main>
      </div>

      {showScrollToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 p-3 bg-teal-600 text-white rounded-full shadow-xl hover:bg-teal-700 transition duration-300 z-50 transform hover:scale-110"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      <Toast toast={toast} />
    </div>
  );
};

export default HomePage;
