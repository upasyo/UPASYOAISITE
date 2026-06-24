import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sun, 
  Moon, 
  ArrowRight, 
  Github, 
  ExternalLink, 
  FileText, 
  Search, 
  Send, 
  Mail, 
  User, 
  ChevronRight, 
  Sparkles, 
  Terminal, 
  Award, 
  CheckCircle2, 
  Database,
  Cpu,
  Brain,
  MessageSquare,
  BookOpen,
  Menu,
  X,
  Plus,
  ArrowUp,
  Linkedin,
  Facebook,
  Instagram,
  MessageCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { 
  fetchDoc, 
  fetchCollection, 
  submitContactMessage, 
  seedDatabaseIfEmpty, 
  COLLECTIONS,
  SEED_DATA
} from "./firebase";
import NetworkLogo from "./components/NetworkLogo";
import NeuralBackground from "./components/NeuralBackground";
import AIAssistant from "./components/AIAssistant";
import AdminDashboard from "./components/AdminDashboard";
import ButtonLinks from "./components/ButtonLinks";
import Typewriter from "./components/Typewriter";
import { useLocalStorageState } from "./hooks/useLocalStorage";
import { TRANSLATIONS, CONTENT_TRANSLATIONS } from "./translations";
// @ts-ignore
import swissAlpsImage from "./assets/images/swiss_alps_white_1782287887159.jpg";

export default function App() {
  // Language preference state using LocalStorage helper
  const [language, setLanguage] = useLocalStorageState<"en" | "other">("upasyo-lang", "en");

  // Translation helper functions
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  const getLocalizedContent = (sectionKey: string, currentData: any, itemUniqueKey?: string) => {
    if (language === "en" || !currentData) return currentData;
    const sectionTranslations = CONTENT_TRANSLATIONS[language]?.[itemUniqueKey || sectionKey];
    if (!sectionTranslations) return currentData;
    return {
      ...currentData,
      ...sectionTranslations
    };
  };

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedMobileMenu, setSelectedMobileMenu] = useState(false);
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);

  // Nav items configuration
  const navItems = [
    { label: "About", href: "#about" },
    { label: "Research", href: "#research" },
    { label: "Projects", href: "#projects" },
    { label: "Papers", href: "#publications" },
    { label: "Benchmarks", href: "#achievements" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" }
  ];

  // Database contents
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});
  const [researchVision, setResearchVision] = useState<any>({});
  const [researchAreas, setResearchAreas] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [animations, setAnimations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Blog filters & reader
  const [blogSearch, setBlogSearch] = useState("");
  const [selectedBlogCategory, setSelectedBlogCategory] = useState("All");
  const [activeBlogArticle, setActiveBlogArticle] = useState<any | null>(null);

  // Form states
  const [contactName, setContactName] = useLocalStorageState("contact_name", "");
  const [contactEmail, setContactEmail] = useLocalStorageState("contact_email", "");
  const [contactSubject, setContactSubject] = useLocalStorageState("contact_subject", "");
  const [contactMessage, setContactMessage] = useLocalStorageState("contact_message", "");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState(false);

  // Admin Dashboard drawer state
  const [displayAdmin, setDisplayAdmin] = useState(false);
  const [greeting, setGreeting] = useState("");

  // 1. Theme Engine & Time detection hook
  useEffect(() => {
    const hours = new Date().getHours();
    setGreeting(hours < 12 ? "Good Morning" : "Good Evening");

    // Detect cached preference
    const cachedPreference = localStorage.getItem("upasyo-theme");
    if (cachedPreference) {
      const isDark = cachedPreference === "dark";
      setIsDarkMode(isDark);
      applyTheme(isDark);
    } else {
      // Default to light mode (clean snowy Swiss Alps look) instead of hour tracking
      setIsDarkMode(false);
      applyTheme(false);
    }
  }, []);

  const applyTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    applyTheme(nextDark);
    localStorage.setItem("upasyo-theme", nextDark ? "dark" : "light");
  };

  // 2. Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Load Data & Seed on mount
  const loadProfileParameters = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // First seed the database if it is empty, catch error gracefully
      try {
        await seedDatabaseIfEmpty();
      } catch (seedErr) {
        console.warn("Database Seeding Failed or Bypassed:", seedErr);
      }

      // Load parameters
      let siteSnap = null;
      let heroSnap = null;
      let aboutSnap = null;
      let visionSnap = null;

      try {
        siteSnap = await fetchDoc(COLLECTIONS.SITE_SETTINGS, "default");
      } catch (e) {
        console.error("Error fetching siteSettings doc:", e);
      }

      try {
        heroSnap = await fetchDoc(COLLECTIONS.HERO, "default");
      } catch (e) {
        console.error("Error fetching hero doc:", e);
      }

      try {
        aboutSnap = await fetchDoc(COLLECTIONS.ABOUT, "default");
      } catch (e) {
        console.error("Error fetching about doc:", e);
      }

      try {
        visionSnap = await fetchDoc(COLLECTIONS.RESEARCH_VISION, "default");
      } catch (e) {
        console.error("Error fetching researchVision doc:", e);
      }

      const loadedSiteSettings = siteSnap ? { ...SEED_DATA.siteSettings, ...siteSnap } : SEED_DATA.siteSettings;
      loadedSiteSettings.buttons = { ...SEED_DATA.siteSettings.buttons, ...loadedSiteSettings.buttons };
      setSiteSettings(loadedSiteSettings);
      setHero(heroSnap ? { ...SEED_DATA.heroSection, ...heroSnap } : SEED_DATA.heroSection);
      setAbout(aboutSnap ? { ...SEED_DATA.aboutSection, ...aboutSnap } : SEED_DATA.aboutSection);
      setResearchVision(visionSnap ? { ...SEED_DATA.researchVision, ...visionSnap } : SEED_DATA.researchVision);

      let areas = [];
      try {
        areas = await fetchCollection(COLLECTIONS.RESEARCH_AREAS);
      } catch (e) {
        console.error("Error fetching researchAreas:", e);
      }
      setResearchAreas(areas && areas.length > 0 ? areas : SEED_DATA.researchAreas);

      let projs = [];
      try {
        projs = await fetchCollection(COLLECTIONS.PROJECTS);
      } catch (e) {
        console.error("Error fetching projects:", e);
      }
      setProjects(projs && projs.length > 0 ? projs : SEED_DATA.projects);

      let pubs = [];
      try {
        pubs = await fetchCollection(COLLECTIONS.PUBLICATIONS);
      } catch (e) {
        console.error("Error fetching publications:", e);
      }
      setPublications(pubs && pubs.length > 0 ? pubs : SEED_DATA.publications);

      let achs = [];
      try {
        achs = await fetchCollection(COLLECTIONS.ACHIEVEMENTS);
      } catch (e) {
        console.error("Error fetching achievements:", e);
      }
      setAchievements(achs && achs.length > 0 ? achs : SEED_DATA.achievements);

      let blogs = [];
      try {
        blogs = await fetchCollection(COLLECTIONS.BLOG_POSTS);
      } catch (e) {
        console.error("Error fetching blogPosts:", e);
      }
      setBlogPosts(blogs && blogs.length > 0 ? blogs : SEED_DATA.blogPosts);

      let anims = [];
      try {
        anims = await fetchCollection(COLLECTIONS.ANIMATIONS, false);
      } catch (e) {
        console.error("Error fetching animations:", e);
      }
      setAnimations(anims && anims.length > 0 ? anims : SEED_DATA.animations);

    } catch (err) {
      console.error("Error drawing Firestore items entirely:", err);
      // Fallback everything
      setSiteSettings(SEED_DATA.siteSettings);
      setHero(SEED_DATA.heroSection);
      setAbout(SEED_DATA.aboutSection);
      setResearchVision(SEED_DATA.researchVision);
      setResearchAreas(SEED_DATA.researchAreas);
      setProjects(SEED_DATA.projects);
      setPublications(SEED_DATA.publications);
      setAchievements(SEED_DATA.achievements);
      setBlogPosts(SEED_DATA.blogPosts);
      setAnimations(SEED_DATA.animations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileParameters();
  }, []);

  const getMotionProps = (selector: string, defaultEffect = "fade-up", defaultDuration = 700, defaultDelay = 0) => {
    const config = animations.find(a => a.selector === selector && a.type === "aos");
    
    if (config && config.enabled === false) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-120px" },
        transition: { duration: 0 }
      };
    }

    const effect = config ? config.effect : defaultEffect;
    const duration = config ? (Number(config.duration) || defaultDuration) : defaultDuration;
    const delay = config ? (Number(config.delay) || defaultDelay) : defaultDelay;

    let initial: any = { opacity: 0, y: 35 };
    let whileInView: any = { opacity: 1, y: 0 };

    if (effect === "fade-up") {
      initial = { opacity: 0, y: 35 };
      whileInView = { opacity: 1, y: 0 };
    } else if (effect === "fade-down") {
      initial = { opacity: 0, y: -35 };
      whileInView = { opacity: 1, y: 0 };
    } else if (effect === "fade-left") {
      initial = { opacity: 0, x: 35 };
      whileInView = { opacity: 1, x: 0 };
    } else if (effect === "fade-right") {
      initial = { opacity: 0, x: -35 };
      whileInView = { opacity: 1, x: 0 };
    } else if (effect === "zoom-in") {
      initial = { opacity: 0, scale: 0.85 };
      whileInView = { opacity: 1, scale: 1 };
    } else if (effect === "zoom-out") {
      initial = { opacity: 0, scale: 1.15 };
      whileInView = { opacity: 1, scale: 1 };
    } else if (effect === "flip-up") {
      initial = { opacity: 0, rotateX: 60 };
      whileInView = { opacity: 1, rotateX: 0 };
    } else if (effect === "flip-down") {
      initial = { opacity: 0, rotateX: -60 };
      whileInView = { opacity: 1, rotateX: 0 };
    }

    return {
      initial,
      whileInView,
      viewport: { once: true, margin: "-120px" },
      transition: { duration: duration / 1000, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] as any }
    };
  };


  // 4. Handle forms submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setContactLoading(true);
    try {
      await submitContactMessage(contactName, contactEmail, contactSubject || "Inquiry", contactMessage);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
      setTimeout(() => setContactSuccess(false), 8000);
    } catch (err) {
      setContactError(true);
      setTimeout(() => setContactError(false), 8000);
    } finally {
      setContactLoading(false);
    }
  };

  // Localized Content Instances
  const localizedHero = getLocalizedContent("heroSection", hero);
  const localizedAbout = getLocalizedContent("aboutSection", about);
  const localizedResearchVision = getLocalizedContent("researchVision", researchVision);
  const localizedResearchAreas = researchAreas.map((area, idx) => getLocalizedContent(`area${idx + 1}`, area, area.id));
  const localizedProjects = projects.map((proj, idx) => getLocalizedContent(`proj${idx + 1}`, proj, proj.id));
  const localizedPublications = publications.map((pub, idx) => getLocalizedContent(`pub${idx + 1}`, pub, pub.id));
  const localizedAchievements = achievements.map((ach, idx) => getLocalizedContent(`ach${idx + 1}`, ach, ach.id));
  const localizedBlogPosts = blogPosts.map((post, idx) => getLocalizedContent(`blog${idx + 1}`, post, post.id));

  // Split ticker text from site settings or fallback to default
  const tickerItems = (siteSettings.tickerText || "ARTIFICIAL GENERAL INTELLIGENCE, NEURO-SYMBOLIC REASONING, TRANSFORMER ATTENTION SCALING, MECHANISTIC INTERPRETABILITY, REINFORCEMENT LEARNING WITH AI FEEDBACK (RLAIF), ASSOCIATIVE RETRIEVAL TOPOLOGY, AI SAFETY & SYSTEM GUARANTEES")
    .split(",")
    .map((item: string) => item.trim())
    .filter(Boolean);

  // List unique blog categories dynamically
  const blogCategories = ["All", ...Array.from(new Set(localizedBlogPosts.map(post => post.category).filter(Boolean)))];

  // Filter posts
  const filteredBlogPosts = localizedBlogPosts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(blogSearch.toLowerCase()) || 
                          post.summary?.toLowerCase().includes(blogSearch.toLowerCase());
    const matchesCategory = selectedBlogCategory === "All" || post.category === selectedBlogCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen relative font-sans overflow-x-hidden ${
      isDarkMode ? "bg-brand-dark-base text-gray-200 selection:bg-pink-950 selection:text-pink-200" : "bg-white text-gray-800 selection:bg-pink-100"
    }`}>
      {/* Decorative Warm Cream / Pale Pink subtle background radial glow elements in light mode */}
      {!isDarkMode && (
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-brand-cream via-pink-50/20 to-white -z-20 pointer-events-none select-none opacity-80" />
      )}

      {/* Dynamic Animated Neural Connection Background canvas */}
      <NeuralBackground isDarkMode={isDarkMode} />

      {/* 1. Animated Top Sticky Scroll progress bar */}
      <div 
        id="top-progress-scroll"
        className="fixed top-0 left-0 h-[4px] bg-gradient-to-r from-pink-400 via-rose-400 to-brand-accent-pink z-[9999] shadow-[0_2px_12px_rgba(244,114,182,0.85)] transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-[100] navbar-glass py-3.5 transition-all">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between">
          
          {/* Logo brand */}
          <NetworkLogo isDarkMode={isDarkMode} brandName={siteSettings.brandName} />

          {/* Desktop Navigation with sliding highlight and high text contrast */}
          <nav className="hidden lg:flex items-center gap-3" id="desktop-routing">
            {navItems.map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                className="relative px-3.5 py-2 text-[11.5px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-800 hover:text-brand-accent-pink dark:text-zinc-200 dark:hover:text-brand-accent-pink transition-colors"
                onMouseEnter={() => setHoveredNavIndex(idx)}
                onMouseLeave={() => setHoveredNavIndex(null)}
              >
                <span className="relative z-10">{item.label}</span>
                {hoveredNavIndex === idx && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-brand-accent-pink rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Tool Control Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Manual Toggle */}
            <button
              onClick={handleToggleTheme}
              id="theme-manual-toggle"
              className="p-2.5 rounded-full bg-slate-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-pink-300 transition-all cursor-pointer shadow-xs"
              title="Toggle Day/Night manual mode override"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />}
            </button>

            {/* CMS Portal Trigger Link */}
            <button
              onClick={() => setDisplayAdmin(!displayAdmin)}
              id="cms-dashboard-trigger"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-[11px] font-mono uppercase font-bold transition-all cursor-pointer ${
                displayAdmin 
                  ? "bg-brand-accent-pink text-white border-brand-accent-pink shadow-lg" 
                  : "bg-slate-900 dark:bg-white text-white dark:text-gray-950 border-transparent hover:bg-slate-800 dark:hover:bg-zinc-100"
              }`}
            >
              <Database className="w-3.5 h-3.5 animate-pulse" />
              <span>CMS_ADMIN</span>
            </button>

            {/* Mobile menu hamburger toggle with rotation transition */}
            <button
              onClick={() => setSelectedMobileMenu(!selectedMobileMenu)}
              className="lg:hidden p-2.5 text-zinc-800 dark:text-white cursor-pointer relative focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              <motion.div
                animate={{ rotate: selectedMobileMenu ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedMobileMenu ? <X className="w-5 h-5 text-brand-accent-pink" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel with smooth staggered slide-down */}
        <AnimatePresence>
          {selectedMobileMenu && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0, height: 0 },
                visible: {
                  opacity: 1,
                  height: "auto",
                  transition: {
                    height: { duration: 0.35, ease: "easeOut" },
                    staggerChildren: 0.06,
                    delayChildren: 0.05
                  }
                },
                exit: {
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: { duration: 0.25, ease: "easeIn" },
                    staggerChildren: 0.04,
                    staggerDirection: -1
                  }
                }
              }}
              className="lg:hidden bg-white/95 dark:bg-brand-dark-base/95 border-b border-gray-100 dark:border-zinc-900 overflow-hidden"
              id="mobile-routing"
            >
              <div className="flex flex-col gap-4 px-6 py-6 font-mono text-sm uppercase">
                {navItems.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={{
                      hidden: { opacity: 0, x: -15 },
                      visible: { 
                        opacity: 1, 
                        x: 0,
                        transition: { type: "spring", stiffness: 350, damping: 25 }
                      },
                      exit: { opacity: 0, x: -10 }
                    }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setSelectedMobileMenu(false)}
                      className="block py-1 text-zinc-800 hover:text-brand-accent-pink dark:text-zinc-200 dark:hover:text-brand-accent-pink transition-colors font-bold tracking-wider"
                    >
                      {item.label}
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container Stage */}
      <main className="max-w-7xl mx-auto px-5 md:px-10 py-10 space-y-24 md:space-y-36">

        {/* ADMIN DRAWER EXPANSION */}
        <AnimatePresence>
          {displayAdmin && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <AdminDashboard 
                isDarkMode={isDarkMode} 
                onSettingsSaved={() => loadProfileParameters(true)} 
              />
            </motion.section>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Cpu className="w-10 h-10 mx-auto text-brand-accent-pink animate-spin" />
          </div>
        ) : (
          <>
            {/* HERO SECTION */}
            <motion.section
              className="relative flex flex-col-reverse lg:flex-row items-center gap-14 pt-4 md:pt-14"
              id="hero-gate"
              {...getMotionProps("hero-section", "fade-up", 1000, 0)}
            >
              
              {/* Profile Bio details */}
              <div className="flex-1 space-y-7 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent font-display">
                  {(() => {
                    const hours = new Date().getHours();
                    let key = "Good Evening";
                    if (hours < 12) {
                      key = "Good Morning";
                    } else if (hours < 17) {
                      key = "Good Afternoon";
                    }
                    return t(key);
                  })()},
                </h2>
                <div className="badge-quantum">
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                  <span>AI_COGNITIVE_RECON</span>
                </div>

                 <h1 className="text-4xl md:text-6.5xl font-bold tracking-tight bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent font-display leading-[1.05] select-text">
                  {localizedHero.title || "Deciphering the Code of intelligence"}
                </h1>
                
                <div className="text-brand-accent-pink font-mono text-xs sm:text-sm font-semibold tracking-widest uppercase select-text h-[1.5em] flex items-center justify-center lg:justify-start">
                  <Typewriter 
                    texts={
                      language === "other"
                        ? [
                            localizedHero.subtitle || "Científico de IA",
                            "Arquitecto Neural",
                            "Líder de Alineación Multi-Agente",
                            "Pionero Neuro-Simbólico"
                          ]
                        : [
                            localizedHero.subtitle || "AI Scientist & Core Researcher",
                            "Neural Architect & Cognitive Theorist",
                            "Multi-Agent Alignment Lead",
                            "Neuro-Symbolic Pioneer"
                          ]
                    }
                    delay={80}
                    period={2500}
                    className="tracking-widest"
                  />
                </div>
                
                <p className="text-zinc-700 dark:text-zinc-300 text-base md:text-lg max-w-xl leading-relaxed select-text font-light">
                  {localizedHero.description || "Building robust, self-aligned algorithmic transformers capable of multi-layered relational mapping and secure cognitive integration."}
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  {siteSettings?.buttons?.collab?.enabled !== false && (
                    <a 
                      href={siteSettings?.buttons?.collab?.url || "#contact"} 
                      className="btn-primary-quantum"
                      style={siteSettings?.buttons?.collab?.color ? { backgroundColor: siteSettings.buttons.collab.color, borderColor: siteSettings.buttons.collab.color } : {}}
                    >
                      {t(siteSettings?.buttons?.collab?.name || "DEPLOY COGNITIVE COLLAB")}
                      <ArrowRight className="w-4 h-4 text-brand-accent-pink" />
                    </a>
                  )}
                  {siteSettings?.buttons?.resume?.enabled !== false && (
                    <a 
                      href={siteSettings?.buttons?.resume?.url || localizedHero.resumeUrl || "#"} 
                      className="btn-secondary-quantum"
                      style={siteSettings?.buttons?.resume?.color ? { backgroundColor: siteSettings.buttons.resume.color, borderColor: siteSettings.buttons.resume.color } : {}}
                    >
                      <FileText className="w-4 h-4 text-zinc-400" />
                      {t(siteSettings?.buttons?.resume?.name || "DOWNLOAD_RESUME")}
                    </a>
                  )}
                  <ButtonLinks />
                </div>
              </div>

              {/* Dynamic Rotating/Hover Photo display with unique accents */}
              <div className="flex flex-col items-center gap-6 flex-shrink-0">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center select-none">
                  {/* Metallic Silver and Pastel Pink concentric accent frames */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-silver via-zinc-200 dark:via-zinc-800 to-brand-pink animate-spin" style={{ animationDuration: '24s' }} />
                  <div className="absolute inset-2 bg-white rounded-full" />
                  <div className="absolute inset-3.5 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800/80 shadow-2xl bg-white">
                    <img
                      referrerPolicy="no-referrer"
                      src={(localizedHero.profileImage && !localizedHero.profileImage.includes("photo-1507003211169-0a1dd7228f2d") && localizedHero.profileImage !== "#") ? localizedHero.profileImage : swissAlpsImage}
                      alt="UPASYO Profile Photograph"
                      className="w-full h-full object-cover opacity-95 transition-all duration-300 hover:scale-105 active:scale-105"
                    />
                  </div>
                  {/* Micro-metrics overlays around the picture */}
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/50 dark:border-zinc-800/80 px-2.5 py-1 rounded-md text-[9px] font-mono text-zinc-650 dark:text-zinc-350 font-semibold select-none flex items-center gap-1 shadow-xs animate-pulse">
                    <CheckCircle2 className="w-3 h-3 text-brand-accent-pink" /> {t(siteSettings.factualAccuracy ? `FACTUAL_ACCURACY: ${siteSettings.factualAccuracy}` : "FACTUAL_ACCURACY: 99.8%")}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 px-2.5 py-1 rounded-md text-[9px] font-mono text-zinc-650 dark:text-zinc-350 font-semibold select-none flex items-center gap-1 shadow-xs">
                    <Database className="w-3 h-3 text-brand-accent-pink" /> {t(siteSettings.storageStatus ? `STORAGE: ${siteSettings.storageStatus}` : "STORAGE: ONLINE")}
                  </div>
                </div>

              </div>
            </motion.section>

            {/* SCROLLING TECHNICAL TICKER */}
            <div className="w-full overflow-hidden bg-brand-cream/10 dark:bg-brand-dark-card/30 border-y border-zinc-150/40 dark:border-zinc-900/80 py-5 select-none font-mono">
              <div className="animate-scrolling-ticker flex gap-12 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                {[...tickerItems, ...tickerItems].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span>{t(item)}</span>
                    {idx < (tickerItems.length * 2 - 1) && <span className="text-brand-accent-pink">•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ABOUT & DETAILED BIO */}
            <motion.section
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
              id="about"
              {...getMotionProps("about-section", "fade-left", 1000, 100)}
            >
              <div className="lg:col-span-4 font-mono select-none">
                <span className="text-brand-accent-pink text-xs font-bold uppercase tracking-widest block mb-1">01 / {t("SYSTEM_BIO")}</span>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-display">{t("SCIENTIFIC DISCIPLINE")}</h2>
                <div className="w-12 h-[2.5px] bg-brand-accent-pink mt-4" />
              </div>

              <div className="lg:col-span-8 space-y-7 select-text text-zinc-700 dark:text-zinc-300">
                <p className="text-base sm:text-lg leading-relaxed font-medium font-sans text-zinc-900 dark:text-zinc-100">
                  {localizedAbout.bio || "Pioneering experimental training architectures across high-performance TPU layouts. My goals center around creating transparent cognitive structures that do not degrade in logical correctness."}
                </p>

                <div>
                  <h4 className="text-xs font-mono font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-widest mb-4">{t("CORE TECHNICAL SPECIALIZATIONS")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {localizedAbout.skills?.map((skill: string, index: number) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="flex items-center gap-2.5 bg-slate-50/50 dark:bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-150/40 dark:border-zinc-900/60 hover:border-pink-200/50 dark:hover:border-pink-950/40 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 bg-brand-accent-pink rounded-full flex-shrink-0 animate-pulse" />
                        <span className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* RESEARCH VISION & THEMATIC INROADS */}
            <motion.section
              className="space-y-12"
              id="research"
              {...getMotionProps("research-areas", "zoom-in", 800, 200)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono select-none">
                <div className="lg:col-span-4">
                  <span className="text-brand-accent-pink text-xs font-bold uppercase tracking-widest block mb-1">02 / {t("RESEARCH_METRICS")}</span>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-display">{t("VISION & FOCUS AREAS")}</h2>
                  <div className="w-12 h-[2.5px] bg-brand-accent-pink mt-4" />
                </div>
              </div>

              {/* Research Vision paragraph layout */}
              <div className="bg-brand-cream/15 dark:bg-[#121214]/50 border border-zinc-150/40 dark:border-zinc-900/80 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xs space-y-4">
                <h3 className="font-mono text-sm md:text-base font-bold text-brand-accent-pink uppercase select-text tracking-wide">
                  {localizedResearchVision.title || "COGNITIVE ALIGNMENT TARGETS"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-medium select-text">
                  <p>{localizedResearchVision.paragraph1}</p>
                  <p>{localizedResearchVision.paragraph2}</p>
                </div>
              </div>

              {/* Interactive Focus area cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {localizedResearchAreas.map((area, index) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card-premium p-6 sm:p-7 flex flex-col justify-between group"
                    id={`research-area-${index}`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/20 text-brand-accent-pink border border-pink-100/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Cpu className="w-5 h-5 animate-pulse" />
                      </div>
                      <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-white mb-2.5 uppercase tracking-wide group-hover:text-brand-accent-pink transition-colors">
                        {area.title}
                      </h4>
                      <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-light select-text">
                        {area.description}
                      </p>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-6">
                      GRID_LOC_0{index + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* PROJECTS PORTFOLIO */}
            <motion.section
              className="space-y-12"
              id="projects"
              {...getMotionProps("projects", "fade-right", 900, 150)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono select-none">
                <div className="lg:col-span-4">
                  <span className="text-brand-accent-pink text-xs font-bold uppercase tracking-widest block mb-1">03 / {t("CODE_ORBITS")}</span>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-display">{t("APPLIED EMBEDDED SYSTEMS")}</h2>
                  <div className="w-12 h-[2.5px] bg-brand-accent-pink mt-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {localizedProjects.map((proj, index) => (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card-premium p-6 md:p-8 flex flex-col justify-between group"
                    id={`project-card-${index}`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-mono text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-accent-pink transition-colors">
                            {proj.title}
                          </h3>
                          <p className="text-[10px] text-brand-accent-pink font-semibold uppercase font-mono tracking-widest mt-1">
                            {proj.subtitle}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {proj.github && (
                            <a 
                              href={proj.github} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                          {proj.demo && (
                            <a 
                              href={proj.demo} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-gray-400 hover:text-brand-accent-pink transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-light select-text">
                        {proj.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {proj.tags?.map((t: string) => (
                          <span key={t} className="text-[10px] font-mono font-bold bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-250 px-2.5 py-1 rounded-md border border-zinc-200/80 dark:border-zinc-800/60">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-200/60 dark:border-zinc-800 pt-4 mt-6">
                      <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1 select-none">{t("SCIENTIFIC IMPACT METRICS")}</div>
                      <p className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-200">{proj.impact}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* PUBLICATIONS BIBLIOGRAPHY */}
            <motion.section
              className="space-y-12"
              id="publications"
              {...getMotionProps("publications", "fade-up", 1000, 50)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono select-none">
                <div className="lg:col-span-4">
                  <span className="text-brand-accent-pink text-xs font-bold uppercase tracking-widest block mb-1">04 / {t("BIBLIOGRAPHY_CITE")}</span>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-display">{t("SELECTED PUBLICATIONS")}</h2>
                  <div className="w-12 h-[2.5px] bg-brand-accent-pink mt-4" />
                </div>
              </div>

              <div className="space-y-4">
                {localizedPublications.map((p, index) => (
                  <motion.div 
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="p-5 md:p-6 bg-white dark:bg-zinc-900/40 hover:bg-slate-50/60 dark:hover:bg-zinc-900/80 rounded-xl border border-zinc-150/50 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all duration-300 hover:scale-[1.005] hover:border-pink-200/50 dark:hover:border-pink-950/40 shadow-xs"
                    id={`pub-item-${index}`}
                  >
                    <div className="space-y-2 max-w-3xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base leading-snug group-hover:text-brand-accent-pink transition-colors select-text">
                        "{p.title}"
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tracking-wide uppercase">
                        {t("AUTHORS:")} <span className="text-zinc-800 dark:text-zinc-200 font-sans normal-case font-light text-xs">{p.authors}</span>
                      </p>
                      <p className="text-[10px] sm:text-xs font-semibold text-brand-accent-pink font-mono tracking-widest uppercase">
                        {p.venue}
                      </p>
                    </div>

                    <div className="flex items-center gap-4.5 flex-shrink-0 font-mono text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">{p.date}</span>
                      {p.url && siteSettings?.buttons?.citeAbs?.enabled !== false && (
                        <a 
                          href={p.url}
                          className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-brand-accent-pink px-3.5 py-1.5 rounded-lg font-bold hover:text-brand-accent-pink transition-all text-[11px] tracking-wide cursor-pointer"
                          style={siteSettings?.buttons?.citeAbs?.color ? { backgroundColor: siteSettings.buttons.citeAbs.color, borderColor: siteSettings.buttons.citeAbs.color } : {}}
                        >
                          {t(siteSettings?.buttons?.citeAbs?.name || "CITE_ABS")} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* BENCHMARKS & ACHIEVEMENTS */}
            <motion.section
              className="space-y-12"
              id="achievements"
              {...getMotionProps("achievements", "zoom-in", 900, 100)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono select-none">
                <div className="lg:col-span-4">
                  <span className="text-brand-accent-pink text-xs font-bold uppercase tracking-widest block mb-1">05 / {t("RECOGNITION_BOARD")}</span>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-display">{t("ACCOLADES & MILESTONES")}</h2>
                  <div className="w-12 h-[2.5px] bg-brand-accent-pink mt-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {localizedAchievements.map((ach, index) => (
                  <motion.div 
                    key={ach.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card-premium p-6 flex gap-4 hover:scale-[1.005] transition-all"
                    id={`achievement-item-${index}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-brand-accent-pink flex-shrink-0 border border-pink-100/50">
                      <Award className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-mono text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                        {ach.title}
                      </h4>
                      <p className="text-[10px] text-brand-accent-pink font-semibold font-mono tracking-widest uppercase">{ach.issuer}</p>
                      <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-light mt-2 select-text">
                        {ach.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* RESEARCH BLOG SECTION */}
            <motion.section
              className="space-y-12"
              id="blog"
              {...getMotionProps("blog", "fade-left", 1000, 200)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end justify-between border-b border-zinc-150/50 dark:border-zinc-900 pb-5 font-mono">
                <div className="lg:col-span-5 select-none">
                  <span className="text-brand-accent-pink text-xs font-bold uppercase tracking-widest block mb-1">06 / {t("REASON_POSTS")}</span>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase font-display">{t("SCIENTIFIC RESEARCH BLOG")}</h2>
                  <div className="w-12 h-[2.5px] bg-brand-accent-pink mt-4" />
                </div>

                {/* Search / Filters block */}
                <div className="lg:col-span-7 flex flex-col sm:flex-row gap-3 w-full">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={t("Telemetry keyword search...")}
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      className="w-full bg-slate-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-accent-pink dark:text-white transition-all shadow-xs"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex gap-1 overflow-x-auto py-1">
                    {blogCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedBlogCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase cursor-pointer whitespace-nowrap transition-all ${
                          selectedBlogCategory === cat 
                            ? "bg-slate-900 dark:bg-brand-pink text-white dark:text-slate-950 shadow-xs" 
                            : "bg-slate-50/60 dark:bg-zinc-900/50 text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        }`}
                      >
                        {cat === "All" ? t("All") : cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic blog grid */}
              {filteredBlogPosts.length === 0 ? (
                <p className="text-center text-xs font-mono text-zinc-400 py-12 select-none">
                  {t("No research entries locate coordinates matching constraints.")}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredBlogPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="card-premium flex flex-col justify-between group"
                      id={`blog-card-${index}`}
                    >
                      <div>
                        {post.image ? (
                          <div className="h-48 overflow-hidden select-none relative bg-neutral-100">
                            <img
                              referrerPolicy="no-referrer"
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover grayscale brightness-95 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                            />
                            <span className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 border border-zinc-150/40 px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-700 dark:text-zinc-300 font-semibold shadow-xs">
                              {post.category}
                            </span>
                          </div>
                        ) : (
                          <div className="h-2 bg-gradient-to-r from-brand-silver via-brand-pink to-brand-cream" />
                        )}

                        <div className="p-6 md:p-8 space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                            <span>{post.date}</span>
                            <span>{post.readingTime || "5 min read"}</span>
                          </div>

                          <h3 
                            onClick={() => setActiveBlogArticle(post)}
                            className="text-lg md:text-xl font-bold font-sans text-gray-900 dark:text-white hover:text-brand-accent-pink transition-colors cursor-pointer leading-tight"
                          >
                            {post.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-light select-text">
                            {post.summary}
                          </p>
                        </div>
                      </div>

                      {siteSettings?.buttons?.readResearch?.enabled !== false && (
                        <div className="p-6 md:px-8 md:pb-8 border-t border-zinc-200/60 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/20 dark:bg-zinc-900/10">
                          <button
                            onClick={() => setActiveBlogArticle(post)}
                            className="text-xs font-mono font-bold tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                            style={siteSettings?.buttons?.readResearch?.color ? { color: siteSettings.buttons.readResearch.color } : { color: "var(--color-zinc-950)" }}
                          >
                            {t(siteSettings?.buttons?.readResearch?.name || "READ_RESEARCH_POST")}
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                          </button>
                        </div>
                      )}
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.section>

            {/* PREMIUM ANIMATED CONTACT FORM */}
            <motion.section
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-10"
              id="contact"
              {...getMotionProps("contact", "fade-right", 1000, 150)}
            >
              {/* Context text left */}
              <div className="lg:col-span-5 space-y-4 font-mono select-none">
                <span className="text-brand-accent-pink text-xs font-bold uppercase tracking-widest block mb-1">07 / {t("DIRECT_ACCESS")}</span>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white uppercase leading-none font-display">{t("COLLABORATIVE ROUTER")}</h2>
                <div className="w-12 h-[2.5px] bg-brand-accent-pink mt-4" />
                
                <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-300 font-light leading-relaxed select-text font-sans pt-3">
                  {t("Are you managing foundation architectures or investigating neural alignment barriers? Establish a diagnostic link. Submissions write immediately to active Firestore messaging indexes.")}
                </p>

                <div className="space-y-2 pt-4 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4.5 h-4.5 text-zinc-400" />
                    <span className="select-text">upasyokushari@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4.5 h-4.5 text-zinc-400" />
                    <span>COG_SECONDRY: ACTIVE</span>
                  </div>
                </div>

              </div>

              {/* Real-time validated input box */}
              <div className="lg:col-span-7 card-premium p-6 sm:p-8">
                {contactSuccess ? (
                  <div className="py-12 flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 border border-pink-200 text-brand-accent-pink flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 animate-bounce" />
                    </div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-gray-950 dark:text-white">{t("COGNITIVE TUNNEL READY")}</h3>
                    <p className="text-xs text-zinc-650 dark:text-zinc-300 max-w-sm font-sans select-text">
                      {t("Your entry variables were recorded onto active indexes successfully. UPASYO's scheduling algorithms will assess parameters shortly.")}
                    </p>
                    {siteSettings?.buttons?.resetPortal?.enabled !== false && (
                      <button
                        onClick={() => setContactSuccess(false)}
                        className="text-xs font-mono font-bold cursor-pointer uppercase tracking-widest hover:underline"
                        style={siteSettings?.buttons?.resetPortal?.color ? { color: siteSettings.buttons.resetPortal.color } : { color: "var(--color-brand-accent-pink)" }}
                      >
                        {t(siteSettings?.buttons?.resetPortal?.name || "RESET_TELEMETRY_PORTAL")}
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1.5 tracking-wider">{t("VISITOR_NAME")}</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder={t("e.g. Dr. Vance")}
                          className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:border-brand-accent-pink transition-colors shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1.5 tracking-wider">{t("INQUIRY_COORD_EMAIL")}</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder={t("vance@cognitive.org")}
                          className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:border-brand-accent-pink transition-colors shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1.5 tracking-wider">{t("SUBJECT_INDEX")}</label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder={t("e.g. Distributed Alignment safeguards")}
                        className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:border-brand-accent-pink transition-colors shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-zinc-550 dark:text-zinc-450 uppercase mb-1.5 tracking-wider">{t("TELEMETRY_MESSAGE")}</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder={t("Describe parameters of computational framework...")}
                        className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm dark:text-white focus:outline-none focus:border-brand-accent-pink transition-colors shadow-xs"
                      />
                    </div>

                    {contactError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-250/40 rounded-xl font-mono text-[11px] text-red-600 dark:text-red-400">
                        {t("TRANSMISSION_ERROR: Firestore record allocation failed. Verify connection metrics.")}
                      </div>
                    )}

                    {siteSettings?.buttons?.inquiry?.enabled !== false && (
                      <button
                        type="submit"
                        disabled={contactLoading}
                        className="btn-primary-quantum w-full sm:w-auto"
                        style={siteSettings?.buttons?.inquiry?.color ? { backgroundColor: siteSettings.buttons.inquiry.color, borderColor: siteSettings.buttons.inquiry.color } : {}}
                      >
                        {contactLoading ? (
                          <Cpu className="w-4 h-4 animate-spin text-brand-accent-pink" />
                        ) : (
                          <Send className="w-4 h-4 text-brand-accent-pink" />
                        )}
                        {t(siteSettings?.buttons?.inquiry?.name || "TRANSMIT_INQUIRY")}
                      </button>
                    )}
                  </form>
                )}
              </div>
            </motion.section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 py-12 bg-zinc-50/50 dark:bg-brand-dark-base select-none">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-accent-pink rounded-full animate-ping" />
            <span>{siteSettings.footerText || "© 2026 UPASYO. All intellectual resources reserved."}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <a href={siteSettings.linkedinUrl || "https://linkedin.com"} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent-pink transition-colors" title="LinkedIn Profile"><Linkedin className="w-4 h-4" /></a>
            <a href={siteSettings.githubUrl || "https://github.com"} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent-pink transition-colors" title="GitHub Profile"><Github className="w-4 h-4" /></a>
            <a href={siteSettings.facebookUrl || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent-pink transition-colors" title="Facebook Page"><Facebook className="w-4 h-4" /></a>
            <a href={siteSettings.instagramUrl || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent-pink transition-colors" title="Instagram Profile"><Instagram className="w-4 h-4" /></a>
            <a href={siteSettings.whatsappUrl || "https://wa.me"} target="_blank" rel="noopener noreferrer" className="hover:text-brand-accent-pink transition-colors" title="WhatsApp Contact"><MessageCircle className="w-4 h-4" /></a>
            
            <span className="ml-2">{t(siteSettings.systemState ? `SYSTEM STATE: ${siteSettings.systemState}` : "SYSTEM STATE: SAFE_COEXISTENCE")}</span>
            <span>{t(siteSettings.portEntry ? `PORT_ENTRY: ${siteSettings.portEntry}` : "PORT_ENTRY: 3000")}</span>
          </div>
        </div>
      </footer>

      {/* FLOAT AI RAG ASSISTANT WIDGET */}
      <AIAssistant />

      {/* BACK TO TOP FLOATING BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            id="back-to-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 left-6 z-50 flex items-center justify-center bg-white dark:bg-brand-dark-card text-gray-900 dark:text-white border border-zinc-200/60 dark:border-zinc-800/80 shadow-xl w-12 h-12 rounded-full cursor-pointer hover:border-brand-accent-pink/40 hover:text-brand-accent-pink dark:hover:text-brand-accent-pink transition-all"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ACTIVE FULL-PANE BLOG READ OVERLAY MODAL */}
      <AnimatePresence>
        {activeBlogArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] overflow-y-auto px-4 py-8 sm:py-16 flex justify-center"
            id="full-blog-reader"
          >
            <motion.div
              initial={{ y: 30, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, scale: 0.95 }}
              className="bg-white dark:bg-brand-dark-card border border-zinc-150 dark:border-zinc-800 p-6 md:p-10 rounded-2xl max-w-3xl w-full relative shadow-2xl h-fit space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveBlogArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Meta */}
              <div className="space-y-2 mt-2">
                <span className="text-xs bg-pink-100 dark:bg-zinc-800 text-brand-accent-pink px-2.5 py-1 rounded font-mono font-semibold uppercase">
                  {activeBlogArticle.category}
                </span>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{activeBlogArticle.date} · {activeBlogArticle.readingTime || "5 min read"}</p>
                <h2 className="text-2xl md:text-3.5xl font-bold font-sans text-gray-900 dark:text-white leading-tight">
                  {activeBlogArticle.title}
                </h2>
              </div>

              {/* Dynamic AI summary helper */}
              <div className="bg-brand-cream/40 dark:bg-zinc-900/40 border border-pink-100/30 rounded-xl p-4 md:p-5 space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-brand-accent-pink flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-3.5 h-3.5" /> {t("COGNITIVE SUMMARY SYNOPSIS")}
                </h4>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                  {activeBlogArticle.summary}
                </p>
              </div>

              {/* Article Content Rendered via Markdown */}
              <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-zinc-200 text-sm md:text-base leading-relaxed space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <ReactMarkdown>{activeBlogArticle.content || ""}</ReactMarkdown>
              </div>

              {/* Reader Progress indicator bottom bar */}
              <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800">
                {siteSettings?.buttons?.dismissArticle?.enabled !== false && (
                  <button
                    onClick={() => setActiveBlogArticle(null)}
                    className={siteSettings?.buttons?.dismissArticle?.color ? "font-mono font-bold text-xs uppercase px-5 py-3 rounded-xl cursor-pointer text-white" : "bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-mono font-bold text-xs uppercase px-5 py-3 rounded-xl cursor-pointer"}
                    style={siteSettings?.buttons?.dismissArticle?.color ? { backgroundColor: siteSettings.buttons.dismissArticle.color } : {}}
                  >
                    {t(siteSettings?.buttons?.dismissArticle?.name || "DISMISS_ARTICLE")}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
