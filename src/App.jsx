import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import emailjs from 'emailjs-com';
import {
  Menu, X, Sun, Moon, Code, Briefcase, Mail, Home, User, ChevronUp,
  Link, Download, Phone, Calendar, MapPin, Linkedin, Github, School,
  ChevronsRight, Send, Check, AlertTriangle
} from 'lucide-react';

// --- I. CENTRAL DATA CONFIGURATION (EDIT THIS SECTION) ---
const personalData = {
  fullName: "VIGNESHWAR E",
  role: "Java Full Stack Developer | AI & Data Science Graduate",
  bio: "Highly motivated and results-driven Java Full Stack Developer with a strong foundation in modern web technologies and a recent graduation focus on AI and Data Science. I specialize in building robust, scalable enterprise applications using the Spring ecosystem and React/Tailwind CSS.",
  
  // Contact Info
  email: "vigneshwarbanu@gmail.com",
  phone: "+91 63741 45497",
  
  // Links
  github: "VigneshwarE143",
  linkedin: "https://www.linkedin.com/in/vigneshware143",
  resumeLink: "https://drive.google.com/file/d/1gnJeF7mga7jmCGdw5aeFHEk-PYd5WaHK/view?usp=drivesdk",
  
  // Content Sections
  sections: ['home', 'about', 'skills', 'projects', 'education', 'contact'],
  
  skills: [
    { category: "Backend & Core", list: ["Java 17+", "Spring Boot", "REST APIs", "Microservices", "Hibernate/JPA"] },
    { category: "Frontend", list: ["React.js", "JavaScript/TypeScript", "HTML5/CSS3", "Tailwind CSS"] },
    { category: "Databases & Tools", list: ["PostgreSQL", "MySQL", "MongoDB", "Git/GitHub", "Docker"] },
    { category: "Data & AI", list: ["Python", "Machine Learning", "Data Analysis", "Pandas/NumPy"] }
  ],
  
  projects: [
    { 
      title: "Enterprise E-Commerce Catalog Service", 
      description: "Developed a scalable, full-featured e-commerce catalog backend. Features include product management, secure authentication (JWT), and advanced searching.", 
      tech: ["Java", "Spring Boot", "PostgreSQL", "Microservices"], 
      link: "https://github.com/VigneshwarE143/ECOMMERCE-CATALOGUE",
      icon: Briefcase 
    },
    { 
      title: "Real-Time Job Board Backend", 
      description: "Designed and implemented a robust job board platform backend, facilitating real-time job postings and applicant tracking using modern Spring architecture.", 
      tech: ["Java", "Spring", "Hibernate", "RESTful API"], 
      link: "https://github.com/VigneshwarE143/JOB_BOARD-BACKEND_PROJECT",
      icon: Briefcase 
    },
  ],
  
  education: [
    { type: "B.Tech Computer Science", institution: "Agni College of Technology, Chennai", details: "CGPA: 8.3/10", year: "2020-2024" },
    { type: "HSC (Higher Secondary)", institution: "S M Hindu Hr Sec School, Sirkali", details: "Percentage: 72.83%", year: "2019-2020" },
    { type: "SSLC (10th Grade)", institution: "S M Hindu Hr Sec School, Sirkali", details: "Percentage: 78.2%", year: "2017-2018" },
  ]
};

// --- II. CUSTOM HOOKS ---

/**
 * Custom hook for Dark Mode management.
 */
const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) return storedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return { theme, toggleTheme };
};

const useIntersectionObserver = (refs, threshold = 0.5) => {
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { threshold });

        const currentRefs = refs.map(ref => ref.current).filter(Boolean);
        currentRefs.forEach(ref => observer.observe(ref));

        // Fallback: on scroll/resize compute the nearest section and set it immediately.
        const computeNearest = () => {
            try {
                let nearestId = null;
                let minDist = Infinity;
                const viewportMiddle = window.innerHeight * 0.35;
                refs.forEach((r) => {
                    const el = r.current;
                    if (!el) return;
                    const rect = el.getBoundingClientRect();
                    const dist = Math.abs(rect.top - viewportMiddle);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestId = el.id;
                    }
                });
                if (nearestId && nearestId !== activeSection) {
                    setActiveSection(nearestId);
                }
            } catch (e) {
                // ignore
            }
        };

        window.addEventListener('scroll', computeNearest, { passive: true });
        window.addEventListener('resize', computeNearest);

        // Run once to initialize correct active section
        computeNearest();

        return () => {
            currentRefs.forEach(ref => observer.unobserve(ref));
            window.removeEventListener('scroll', computeNearest);
            window.removeEventListener('resize', computeNearest);
        };
    }, [refs, threshold]);

    return activeSection;
};

/**
 * Custom hook for managing floating toast notifications.
 */
const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  return { toast, showToast };
};


// --- III. TOAST COMPONENT ---

const Toast = ({ toast }) => {
  if (!toast) return null;

  const { message, type } = toast;
  
  // Define styles based on type
  const styleMap = {
    success: { 
      bg: 'bg-teal-500', 
      text: 'text-white', 
      Icon: Check 
    },
    error: { 
      bg: 'bg-red-500', 
      text: 'text-white', 
      Icon: X 
    },
    warning: { 
      bg: 'bg-yellow-500', 
      text: 'text-gray-900', 
      Icon: AlertTriangle
    }
  };

  const { bg, text, Icon } = styleMap[type] || styleMap.warning;

  return (
    <div 
      className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl transition-all duration-300 transform ${bg} ${text} z-[100]`}
      style={{ minWidth: '300px' }}
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-3" />
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
};


// --- IV. HELPER COMPONENTS & UTILITIES ---

const SocialLink = ({ Icon, href, username, isSidebar = false }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={username}
        className={`p-2 rounded-full transition duration-300 
            ${isSidebar ? 'text-gray-400 hover:bg-teal-600 hover:text-white' : 'text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200'}
            hover:scale-110`}
    >
        <Icon className="w-5 h-5" />
    </a>
);

// --- V. MAIN LAYOUT AND SECTIONS ---

const App = () => {
    // --- HOOKS AT TOP LEVEL ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { toast, showToast } = useToast();

    // Refs for sections
    const homeRef = useRef(null);
    const aboutRef = useRef(null);
    const skillsRef = useRef(null);
    const projectsRef = useRef(null);
    const educationRef = useRef(null);
    const contactRef = useRef(null);

    const sectionRefs = useMemo(() => [homeRef, aboutRef, skillsRef, projectsRef, educationRef, contactRef], []);
    const activeSection = useIntersectionObserver(sectionRefs, 0.5);

    // Dynamic Navigation items
    const navItems = useMemo(() => ([
        { name: 'Home', icon: Home, ref: homeRef, id: 'home' },
        { name: 'About', icon: User, ref: aboutRef, id: 'about' },
        { name: 'Skills', icon: Code, ref: skillsRef, id: 'skills' },
        { name: 'Projects', icon: Briefcase, ref: projectsRef, id: 'projects' },
        { name: 'Education', icon: School, ref: educationRef, id: 'education' },
        { name: 'Contact', icon: Mail, ref: contactRef, id: 'contact' },
    ]), []);

    // Scroll handlers
    const scrollToSection = useCallback((ref) => {
        if (ref.current) {
            // Use 0 offset for desktop because the content is shifted by pl-80
            // Use 90px offset for mobile to account for the fixed top navbar (h-16 = 64px) + buffer
            const offset = window.innerWidth >= 768 ? 0 : 90; 
            
            // Adjust the top position by subtracting the offset
            window.scrollTo({
                top: ref.current.offsetTop - offset,
                behavior: 'smooth',
            });
            setIsMobileMenuOpen(false); // Close menu on click
        }
    }, []);

    const handleScroll = () => {
        setShowScrollToTop(window.scrollY > 500);
    };

    // Effects
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- SUB-COMPONENTS (Defined inside App for scope access) ---

    const NavLink = ({ item, isSidebar = false }) => {
        const isActive = activeSection === item.id;
        const baseClasses = "flex items-center w-full py-2 px-3 transition-all duration-200 rounded-xl font-medium";
        const activeClasses = isSidebar 
            ? "bg-teal-600 text-white shadow-lg" 
            : "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300";
        const inactiveClasses = isSidebar 
            ? "text-gray-600 dark:text-gray-400 hover:bg-teal-50 hover:dark:bg-gray-800"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800";
        
        return (
            <button
                onClick={() => scrollToSection(item.ref)}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isSidebar ? 'justify-start' : 'justify-start'}`}
            >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
            </button>
        );
    };

    const ThemeToggle = ({ isSidebar = false }) => {
        const Icon = theme === 'light' ? Moon : Sun;
        return (
            <button
                onClick={toggleTheme}
                aria-label={`Toggle to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                className={`p-2 rounded-full transition duration-300 
                    ${isSidebar ? 'text-gray-600 dark:text-gray-400 hover:bg-teal-600 hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <Icon className="w-5 h-5" />
            </button>
        );
    };

    // --- DESKTOP SIDEBAR ---
    const Sidebar = () => (
        // Sidebar width w-72 and main content padding md:pl-80 ensure no overlap on desktop
        <aside className="hidden md:flex flex-col w-72 fixed h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 shadow-xl p-6 z-50">
            <div className="flex flex-col flex-grow">
                {/* Logo/Title */}
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
                    {personalData.fullName.split(' ')[0]}
                    <span className="text-teal-600 dark:text-teal-400 ml-1">
                        {personalData.fullName.split(' ')[1]}
                    </span>
                </h1>

                {/* Navigation Links */}
                <nav className="space-y-2 flex-grow">
                    {navItems.map(item => (
                        <NavLink key={item.id} item={item} isSidebar={true} />
                    ))}
                </nav>

                {/* Footer/Socials/Theme */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-around mb-4">
                        <SocialLink Icon={Github} username="GitHub" href={`https://github.com/${personalData.github}`} isSidebar={true} />
                        <SocialLink Icon={Linkedin} username="LinkedIn" href={personalData.linkedin} isSidebar={true} />
                        <ThemeToggle isSidebar={true} />
                    </div>
                    <p className="text-xs text-center text-gray-400 dark:text-gray-600">
                        &copy; {new Date().getFullYear()} {personalData.fullName.split(' ')[0]}
                    </p>
                </div>
            </div>
        </aside>
    );

    // --- MOBILE NAVBAR & MENU ---
    const MobileNavbar = () => (
        <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center h-16 px-4">
                {/* Logo/Title */}
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {personalData.fullName.split(' ')[0]}
                    <span className="text-teal-600 dark:text-teal-400 ml-1">
                        {personalData.fullName.split(' ')[1]}
                    </span>
                </h1>
                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 p-4' : 'max-h-0 opacity-0'}`}>
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <NavLink key={item.id} item={item} isSidebar={false} />
                    ))}
                </nav>
                <div className="flex justify-center space-x-6 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                    <SocialLink Icon={Github} username="GitHub" href={`https://github.com/${personalData.github}`} />
                    <SocialLink Icon={Linkedin} username="LinkedIn" href={personalData.linkedin} />
                </div>
            </div>
        </header>
    );

    // --- SECTION COMPONENTS ---

    const SectionTitle = ({ children }) => (
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-10 pb-2 border-b-4 border-teal-300 dark:border-teal-700 inline-block">
            {children}
        </h2>
    );
    
    const HeroSection = () => (
        <section id="home" ref={homeRef} className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-500">
            <div className="max-w-4xl mx-auto p-8 text-center">
                
                {/* Portrait: place your pasted image at `public/portrait.jpg` or `src/assets/portrait.jpg`.
                    We reference `/portrait.jpg` (public root) so dropping the file into the `public` folder will load it automatically.
                    Fallback to a placeholder if the image is missing. The markup creates a circular photo with a white ring. */}
                <div className="mx-auto mb-6 w-52 h-52 rounded-full bg-white p-1 shadow-xl relative">
                    <div className="w-full h-full rounded-full overflow-hidden">
                        <img
                            src="/portrait.png"
                            alt={`${personalData.fullName}'s profile`}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/220x220/4b5563/ffffff?text=V.E'; }}
                        />
                    </div>
                    {/* thin inner ring (white) already provided by the parent padding; add subtle outline */}
                    <span className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: '0 0 0 4px rgba(255,255,255,0.5), 0 6px 18px rgba(2,6,23,0.2)' }} />
                </div>

                <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Hello, I'm</p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                    {personalData.fullName}
                </h1>
                <h2 className="text-2xl sm:text-3xl text-teal-600 dark:text-teal-400 font-semibold mb-8">
                    {personalData.role}
                </h2>
                <p className="max-w-3xl mx-auto text-xl text-gray-700 dark:text-gray-300 mb-10">
                    {personalData.bio}
                </p>

                {/* Call to Action */}
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <a
                        href={personalData.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 transition duration-300 transform hover:-translate-y-1"
                    >
                        <Download className="w-5 h-5 mr-2" /> View Resume
                    </a>
                    <a
                        href={`mailto:${personalData.email}`}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-xl shadow-lg text-teal-600 border-2 border-teal-600 bg-white dark:bg-gray-900 hover:bg-teal-50 dark:hover:bg-gray-800 transition duration-300 transform hover:-translate-y-1"
                    >
                        <Mail className="w-5 h-5 mr-2" /> Email Me
                    </a>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-4 mt-8">
                    <SocialLink Icon={Github} username="GitHub" href={`https://github.com/${personalData.github}`} />
                    <SocialLink Icon={Linkedin} username="LinkedIn" href={personalData.linkedin} />
                </div>
            </div>
        </section>
    );

    const AboutSection = () => (
        <section id="about" ref={aboutRef} className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-500">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <SectionTitle>About Me</SectionTitle>
                <div className="mt-6 space-y-6 text-lg text-gray-700 dark:text-gray-300">
                    <p>
                        I approach development with a strong focus on clean code and robust architecture. My background in AI and Data Science provides a unique edge, allowing me to build not only functional applications but also data-informed features and scalable backend systems.
                    </p>
                    <p>
                        I excel in the **Java Spring Boot ecosystem**, designing and implementing RESTful APIs for microservices. On the frontend, I utilize **React and Tailwind CSS** to create modern, responsive, and highly accessible user interfaces.
                    </p>
                    <p>
                        I'm eager to contribute to projects that push the boundaries of technology and offer opportunities to integrate data-driven insights into core product functionality.
                    </p>
                </div>
            </div>
        </section>
    );

    const SkillsSection = () => (
        <section id="skills" ref={skillsRef} className="py-24 bg-white dark:bg-gray-900 transition-colors duration-500">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <SectionTitle>Skills & Tech Stack</SectionTitle>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {personalData.skills.map((skillGroup, index) => (
                        <div 
                            key={index}
                            className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl transition duration-300 transform hover:shadow-2xl hover:border-teal-500 border-2 border-transparent"
                        >
                            <h3 className="flex items-center text-xl font-bold text-teal-600 dark:text-teal-400 mb-4">
                                <Code className="w-6 h-6 mr-2"/> {skillGroup.category}
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
                    ))}
                </div>
            </div>
        </section>
    );

    const ProjectsSection = () => (
        <section id="projects" ref={projectsRef} className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-500">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <SectionTitle>Featured Projects</SectionTitle>
                
                <div className="mt-6 space-y-12">
                    {personalData.projects.map((project, index) => (
                        <div 
                            key={index}
                            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border-t-8 border-teal-600 dark:border-teal-400 transition duration-500 hover:shadow-3xl"
                        >
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.tech.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 text-sm font-medium rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <a 
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-800 dark:hover:text-teal-200 transition"
                            >
                                <Link className="w-4 h-4 mr-1" /> View Repository
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
    
    const EducationSection = () => (
        <section id="education" ref={educationRef} className="py-24 bg-white dark:bg-gray-900 transition-colors duration-500">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <SectionTitle>Education</SectionTitle>
                
                <div className="mt-6 space-y-10">
                    {personalData.education.map((edu, index) => (
                        <div 
                            key={index}
                            className="relative pl-10 border-l-4 border-teal-300 dark:border-teal-700"
                        >
                            <span className="absolute -left-3 top-0 p-1 rounded-full bg-teal-600 dark:bg-teal-400 text-white shadow-md">
                                <School className="w-5 h-5" />
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{edu.type}</h3>
                            <p className="text-lg text-teal-600 dark:text-teal-400 font-medium mb-1">{edu.institution}</p>
                            <p className="text-gray-600 dark:text-gray-400 italic">{edu.details}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">{edu.year}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    const ContactSection = () => {
        const [form, setForm] = useState({ name: '', email: '', message: '' });
        
        const handleChange = (e) => {
            setForm({ ...form, [e.target.name]: e.target.value });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();

            if (!form.name || !form.email || !form.message) {
                showToast('Please fill all required fields.', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(form.email)) {
                showToast('Please enter a valid email address.', 'error');
                return;
            }

            const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
            const bodyText = `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`;
            const body = encodeURIComponent(bodyText);
            const mailtoLink = `mailto:${personalData.email}?subject=${subject}&body=${body}`;

            // If EmailJS environment variables are provided, try to send via EmailJS first.
            // Configure these in a .env file at project root (Vite):
            // VITE_EMAILJS_SERVICE_ID=your_service_id
            // VITE_EMAILJS_TEMPLATE_ID=your_template_id
            // VITE_EMAILJS_PUBLIC_KEY=your_public_key
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
                    showToast('Message sent successfully via EmailJS. Thank you!', 'success');
                    setForm({ name: '', email: '', message: '' });
                    return;
                } catch (emailErr) {
                    // If EmailJS fails, fallback to mailto/clipboard below
                    console.error('EmailJS send error:', emailErr);
                }
            }

            // Try opening via anchor click (some browsers block location.href mailto)
            try {
                const a = document.createElement('a');
                a.href = mailtoLink;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                showToast('Email client opened. You may need to press Send.', 'success');
                setForm({ name: '', email: '', message: '' });
                return;
            } catch (err) {
                // fallthrough to clipboard fallback
            }

            // Clipboard fallback
            const clipboardText = `${personalData.email}\n\nSubject: Portfolio Contact from ${form.name}\n\n${bodyText}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(clipboardText);
                    showToast('Could not open mail client — message copied to clipboard. Paste into your email composer.', 'warning');
                    setForm({ name: '', email: '', message: '' });
                    return;
                } catch (copyErr) {
                    showToast('Unable to open email client or copy to clipboard. Please contact: ' + personalData.email, 'error');
                    return;
                }
            }

            showToast('Unable to open email client. Please send your message to ' + personalData.email, 'error');
        };

        const ContactInfo = ({ Icon, text, href, title }) => (
            <div className="flex items-start space-x-4">
                <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
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
        
        // Formatted name for display on social links
        const displayName = "Vigneshwar E";

        return (
            <section id="contact" ref={contactRef} className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-500">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    <SectionTitle>Get In Touch</SectionTitle>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
                        {/* Contact Form */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h3>
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
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 flex items-center justify-center py-3 text-lg font-bold rounded-xl shadow-lg text-white bg-teal-600 hover:bg-teal-700 transition duration-300 transform hover:-translate-y-0.5"
                                    >
                                        <Send className="w-5 h-5 mr-2" /> Send Message
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const text = `To: ${personalData.email}\nSubject: Portfolio Contact from ${form.name}\n\n${form.message || ''}`;
                                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                                try {
                                                    await navigator.clipboard.writeText(text);
                                                    showToast('Message copied to clipboard. Paste into your email client.', 'success');
                                                    setForm({ name: form.name, email: form.email, message: form.message });
                                                } catch (err) {
                                                    showToast('Unable to copy to clipboard. Please copy manually.', 'error');
                                                }
                                            } else {
                                                showToast('Clipboard not available. Please copy manually.', 'error');
                                            }
                                        }}
                                        className="flex-none px-4 py-3 text-lg font-bold rounded-xl shadow-inner text-teal-600 border-2 border-teal-600 bg-white dark:bg-gray-900 hover:bg-teal-50 transition duration-300"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        {/* Information Block */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Details</h3>
                            
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
                                href={`tel:${personalData.phone.replace(/\s/g, '')}`}
                            />
                            <ContactInfo 
                                Icon={Linkedin} 
                                title="LinkedIn"
                                text={displayName} 
                                href={personalData.linkedin}
                            />
                            <ContactInfo 
                                Icon={Github} 
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

    // --- MAIN RENDER ---
    return (
        <div className={`min-h-screen font-sans ${theme}`}>
            <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
                
                {/* 1. Desktop Sidebar */}
                <Sidebar />
                
                {/* 2. Mobile Navbar */}
                <MobileNavbar />

                {/* 3. Main Content Area */}
                {/* Responsive content area: full width on mobile, shifted to the right on desktop */}
                <main className="flex-1 md:pl-80 pt-16 md:pt-0"> 
                    <HeroSection />
                    <AboutSection />
                    <SkillsSection />
                    <ProjectsSection />
                    <EducationSection />
                    <ContactSection />
                </main>
            </div>

            {/* 4. Utilities */}
            
            {/* Back to Top Button */}
            {showScrollToTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Back to top"
                    className="fixed bottom-6 right-6 p-3 bg-teal-600 text-white rounded-full shadow-xl hover:bg-teal-700 transition duration-300 z-50 transform hover:scale-110"
                >
                    <ChevronUp className="w-6 h-6" />
                </button>
            )}
            
            {/* Toast Notification */}
            <Toast toast={toast} />
        </div>
    );
};

export default App;
