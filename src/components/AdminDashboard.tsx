import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Settings, 
  User, 
  BookOpen, 
  Cpu, 
  FolderGit2, 
  Award, 
  Key, 
  Lock, 
  Save, 
  Trash2, 
  Plus, 
  Brain, 
  MessageSquare, 
  LogOut,
  RefreshCw,
  Edit2,
  FileCode,
  FileText,
  Video
} from "lucide-react";
import { 
  db, 
  COLLECTIONS, 
  fetchDoc, 
  fetchCollection, 
  updateOrCreateDoc, 
  deleteDocument,
  seedDatabaseIfEmpty,
  SEED_DATA
} from "../firebase";

interface AdminDashboardProps {
  onSettingsSaved: () => void;
  isDarkMode: boolean;
  isAdmin?: boolean;
  setIsAdmin?: (isAdmin: boolean) => void;
  activeTab?: "settings" | "hero" | "research" | "projects" | "pubs" | "achievements" | "blog" | "knowledge" | "messages" | "links" | "animations";
  setActiveTab?: (tab: "settings" | "hero" | "research" | "projects" | "pubs" | "achievements" | "blog" | "knowledge" | "messages" | "links" | "animations") => void;
}

export default function AdminDashboard({ 
  onSettingsSaved, 
  isDarkMode,
  isAdmin,
  setIsAdmin,
  activeTab: passedActiveTab,
  setActiveTab: passedSetActiveTab
}: AdminDashboardProps) {
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(false);
  const isAuthenticated = isAdmin !== undefined ? isAdmin : localIsAuthenticated;
  const setIsAuthenticated = setIsAdmin !== undefined ? setIsAdmin : setLocalIsAuthenticated;

  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [localActiveTab, setLocalActiveTab] = useState<"settings" | "hero" | "research" | "projects" | "pubs" | "achievements" | "blog" | "knowledge" | "messages" | "links" | "animations">("settings");
  const activeTab = passedActiveTab !== undefined ? passedActiveTab : localActiveTab;
  const setActiveTab = passedSetActiveTab !== undefined ? passedSetActiveTab : setLocalActiveTab;
  
  // Loading status
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Safe Action Status Banners
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const triggerStatus = (type: "success" | "error", message: string) => {
    setActionStatus({ type, message });
    setTimeout(() => {
      setActionStatus(prev => prev.message === message ? { type: null, message: "" } : prev);
    }, 5000);
  };

  // States for schemas
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [hero, setHero] = useState<any>({});
  const [about, setAbout] = useState<any>({});
  const [researchVision, setResearchVision] = useState<any>({});
  const [researchAreas, setResearchAreas] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [animations, setAnimations] = useState<any[]>([]);

  // Editing forms state holder (for adds/updates)
  const [newArea, setNewArea] = useState({ title: "", description: "", icon: "Cpu", order: 1 });
  const [newProject, setNewProject] = useState({ title: "", subtitle: "", description: "", tags: "", github: "", demo: "", impact: "", order: 1 });
  const [newPub, setNewPub] = useState({ title: "", authors: "", venue: "", url: "", date: "", order: 1 });
  const [newAch, setNewAch] = useState({ title: "", issuer: "", description: "", order: 1 });
  const [newBlog, setNewBlog] = useState({ title: "", category: "Deep Learning", date: "", readingTime: "5 min", summary: "", content: "", image: "", order: 1 });
  const [newKb, setNewKb] = useState({ content: "", category: "General" });
  const [newLink, setNewLink] = useState({ name: "", url: "", color: "#e11d48" });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingAnimationId, setEditingAnimationId] = useState<string | null>(null);
  const [newAnimation, setNewAnimation] = useState({
    name: "",
    type: "aos",
    selector: "hero-section",
    effect: "fade-up",
    url: "",
    duration: 1000,
    delay: 0,
    enabled: true,
    loop: true,
    speed: "1",
    style: "{\"width\":\"100%\",\"height\":\"240px\"}"
  });

  const adminPasscode = "upasyo2026"; // Secure default pass

  // Fetch all CMS options
  const loadCmsData = async () => {
    const siteSnap = await fetchDoc(COLLECTIONS.SITE_SETTINGS, "default");
    const heroSnap = await fetchDoc(COLLECTIONS.HERO, "default");
    const aboutSnap = await fetchDoc(COLLECTIONS.ABOUT, "default");
    const visionSnap = await fetchDoc(COLLECTIONS.RESEARCH_VISION, "default");

    const loadedSite = siteSnap ? { ...SEED_DATA.siteSettings, ...siteSnap } : SEED_DATA.siteSettings;
    loadedSite.buttons = { ...SEED_DATA.siteSettings.buttons, ...loadedSite.buttons };
    setSiteSettings(loadedSite);
    setHero(heroSnap ? { ...SEED_DATA.heroSection, ...heroSnap } : SEED_DATA.heroSection);
    setAbout(aboutSnap ? { ...SEED_DATA.aboutSection, ...aboutSnap } : SEED_DATA.aboutSection);
    setResearchVision(visionSnap ? { ...SEED_DATA.researchVision, ...visionSnap } : SEED_DATA.researchVision);

    // List collections
    const rAreas = await fetchCollection(COLLECTIONS.RESEARCH_AREAS);
    const projs = await fetchCollection(COLLECTIONS.PROJECTS);
    const pubs = await fetchCollection(COLLECTIONS.PUBLICATIONS);
    const achs = await fetchCollection(COLLECTIONS.ACHIEVEMENTS);
    const blogs = await fetchCollection(COLLECTIONS.BLOG_POSTS);
    const kb = await fetchCollection(COLLECTIONS.KNOWLEDGE_BASE);
    const links = await fetchCollection(COLLECTIONS.BUTTON_LINKS);
    const msgs = await fetchCollection(COLLECTIONS.CONTACT_MESSAGES, false);
    const anims = await fetchCollection(COLLECTIONS.ANIMATIONS, false);

    setResearchAreas(rAreas && rAreas.length > 0 ? rAreas : SEED_DATA.researchAreas);
    setProjects(projs && projs.length > 0 ? projs : SEED_DATA.projects);
    setPublications(pubs && pubs.length > 0 ? pubs : SEED_DATA.publications);
    setAchievements(achs && achs.length > 0 ? achs : SEED_DATA.achievements);
    setBlogPosts(blogs && blogs.length > 0 ? blogs : SEED_DATA.blogPosts);
    setKnowledgeBase(kb);
    setLinks(links || []);
    setAnimations(anims && anims.length > 0 ? anims : SEED_DATA.animations);
    
    // Sort contact messages by timestamp descending
    if (msgs) {
      msgs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setMessages(msgs);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCmsData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPasscode) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid access token code.");
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateOrCreateDoc(COLLECTIONS.SITE_SETTINGS, "default", siteSettings);
      await updateOrCreateDoc(COLLECTIONS.HERO, "default", hero);
      await updateOrCreateDoc(COLLECTIONS.ABOUT, "default", about);
      await updateOrCreateDoc(COLLECTIONS.RESEARCH_VISION, "default", researchVision);
      onSettingsSaved();
      triggerStatus("success", "Metadata settings successfully integrated and persists to Firestore.");
    } catch (err) {
      triggerStatus("error", "Error saving metadata settings. Check firestore connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset/Re-seed mechanism helper
  const handleResetDatabase = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    setIsResetting(true);
    try {
      localStorage.clear();
      // Temporarily clear default setting doc to force seed
      await deleteDocument(COLLECTIONS.SITE_SETTINGS, "default");
      await seedDatabaseIfEmpty();
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Database reset and populated with pristine default seed records.");
      setConfirmReset(false);
    } catch (err) {
      triggerStatus("error", "Error resetting or seeding custom database.");
    } finally {
      setIsResetting(false);
    }
  };

  // Add handlers
  const handleAddResearchArea = async () => {
    if (!newArea.title) return;
    try {
      const itemId = "area_" + Date.now();
      await updateOrCreateDoc(COLLECTIONS.RESEARCH_AREAS, itemId, newArea);
      setNewArea({ title: "", description: "", icon: "Cpu", order: researchAreas.length + 1 });
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Research area added successfully.");
    } catch (err) {
      triggerStatus("error", "Failed to add research area.");
    }
  };

  const handleAddProject = async () => {
    if (!newProject.title) return;
    try {
      const itemId = "proj_" + Date.now();
      const data = {
        ...newProject,
        tags: newProject.tags.split(",").map(t => t.trim()).filter(Boolean)
      };
      await updateOrCreateDoc(COLLECTIONS.PROJECTS, itemId, data);
      setNewProject({ title: "", subtitle: "", description: "", tags: "", github: "", demo: "", impact: "", order: projects.length + 1 });
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Project schematic added successfully.");
    } catch (err) {
      triggerStatus("error", "Failed to add project schematic.");
    }
  };

  const handleAddPublication = async () => {
    if (!newPub.title) return;
    try {
      const itemId = "pub_" + Date.now();
      await updateOrCreateDoc(COLLECTIONS.PUBLICATIONS, itemId, newPub);
      setNewPub({ title: "", authors: "", venue: "", url: "", date: "", order: publications.length + 1 });
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Publication entry added successfully.");
    } catch (err) {
      triggerStatus("error", "Failed to add publication.");
    }
  };

  const handleAddAchievement = async () => {
    if (!newAch.title) return;
    try {
      const itemId = "ach_" + Date.now();
      await updateOrCreateDoc(COLLECTIONS.ACHIEVEMENTS, itemId, newAch);
      setNewAch({ title: "", issuer: "", description: "", order: achievements.length + 1 });
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Benchmark accolade added successfully.");
    } catch (err) {
      triggerStatus("error", "Failed to add benchmark accolade.");
    }
  };

  const handleAddBlogPost = async () => {
    if (!newBlog.title) return;
    try {
      const itemId = "blog_" + Date.now();
      await updateOrCreateDoc(COLLECTIONS.BLOG_POSTS, itemId, newBlog);
      setNewBlog({ title: "", category: "Deep Learning", date: new Date().toLocaleDateString(), readingTime: "5 min", summary: "", content: "", image: "", order: blogPosts.length + 1 });
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Research blog paper added successfully.");
    } catch (err) {
      triggerStatus("error", "Failed to add research blog paper.");
    }
  };

  const handleAddKnowledge = async () => {
    if (!newKb.content) return;
    try {
      const id = "kb_" + Date.now();
      await updateOrCreateDoc(COLLECTIONS.KNOWLEDGE_BASE, id, newKb);
      setNewKb({ content: "", category: "General" });
      await loadCmsData();
      triggerStatus("success", "Knowledge base fact loaded successfully.");
    } catch (err) {
      triggerStatus("error", "Failed to add knowledge base fact.");
    }
  };

  const handleSaveLink = async () => {
    if (!newLink.name || !newLink.url) return;
    try {
      const itemId = editingLinkId || "link_" + Date.now();
      await updateOrCreateDoc(COLLECTIONS.BUTTON_LINKS, itemId, newLink);
      setNewLink({ name: "", url: "", color: "#e11d48" });
      setEditingLinkId(null); // Reset
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", editingLinkId ? "Link button updated successfully." : "Link button added successfully.");
    } catch (err) {
      triggerStatus("error", "Failed to save link button.");
    }
  };

  // Animation CRUD Handlers
  const handleAddAnimation = async () => {
    if (!newAnimation.name) return;
    try {
      const itemId = "anim_" + Date.now();
      await updateOrCreateDoc(COLLECTIONS.ANIMATIONS, itemId, newAnimation);
      setNewAnimation({
        name: "",
        type: "aos",
        selector: "hero-section",
        effect: "fade-up",
        url: "",
        duration: 1000,
        delay: 0,
        enabled: true,
        loop: true,
        speed: "1",
        style: "{\"width\":\"100%\",\"height\":\"240px\"}"
      });
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Animation created and deployed.");
    } catch (err) {
      triggerStatus("error", "Failed to add animation.");
    }
  };

  const handleEditAnimation = (anim: any) => {
    setEditingAnimationId(anim.id);
    setNewAnimation({
      name: anim.name || "",
      type: anim.type || "aos",
      selector: anim.selector || "hero-section",
      effect: anim.effect || "fade-up",
      url: anim.url || "",
      duration: anim.duration || 1000,
      delay: anim.delay || 0,
      enabled: anim.enabled !== false,
      loop: anim.loop !== false,
      speed: anim.speed || "1",
      style: anim.style || "{\"width\":\"100%\",\"height\":\"240px\"}"
    });
  };

  const handleUpdateAnimation = async () => {
    if (!editingAnimationId) return;
    try {
      await updateOrCreateDoc(COLLECTIONS.ANIMATIONS, editingAnimationId, newAnimation);
      setEditingAnimationId(null);
      setNewAnimation({
        name: "",
        type: "aos",
        selector: "hero-section",
        effect: "fade-up",
        url: "",
        duration: 1000,
        delay: 0,
        enabled: true,
        loop: true,
        speed: "1",
        style: "{\"width\":\"100%\",\"height\":\"240px\"}"
      });
      await loadCmsData();
      onSettingsSaved();
      triggerStatus("success", "Animation updated and synchronized.");
    } catch (err) {
      triggerStatus("error", "Failed to update animation settings.");
    }
  };

  const handleCancelEditAnimation = () => {
    setEditingAnimationId(null);
    setNewAnimation({
      name: "",
      type: "aos",
      selector: "hero-section",
      effect: "fade-up",
      url: "",
      duration: 1000,
      delay: 0,
      enabled: true,
      loop: true,
      speed: "1",
      style: "{\"width\":\"100%\",\"height\":\"240px\"}"
    });
  };

  // Delete Handlers
  const handleDeleteItem = async (col: string, id: string) => {
    const confirmationKey = `${col}_${id}`;
    if (pendingDeleteId !== confirmationKey) {
      setPendingDeleteId(confirmationKey);
      setTimeout(() => setPendingDeleteId(prev => prev === confirmationKey ? null : prev), 5000);
      return;
    }
    setPendingDeleteId(null);
    try {
      await deleteDocument(col, id);
      triggerStatus("success", "Item deleted successfully from database.");
      loadCmsData();
      onSettingsSaved();
    } catch (e) {
      triggerStatus("error", "Error deleting item from Firestore.");
    }
  };

  const getDeleteBtnClass = (col: string, id: string) => {
    const key = `${col}_${id}`;
    return pendingDeleteId === key 
      ? "text-xs font-mono font-bold text-red-600 bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2.5 py-1 rounded transition-all cursor-pointer animate-pulse"
      : "text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors";
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 dark:bg-zinc-950 p-8 rounded-2xl border border-zinc-200/50 dark:border-zinc-900 max-w-md mx-auto my-12 shadow-xl" id="admin-login-panel">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-brand-accent-pink mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">ADMIN CMS COMPILER</h2>
          <p className="text-xs text-gray-500 font-mono mt-1 uppercase">Authentication Required</p>
          
          <form onSubmit={handleLogin} className="w-full mt-6 space-y-4">
            <div>
              <label className="block text-left text-xs font-mono font-semibold text-gray-600 dark:text-zinc-400 mb-1.5 uppercase">
                Access Token Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter token passcode..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-300 dark:text-white font-mono text-center"
                />
                <Key className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
              </div>
            {/* <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-1.5 text-center">
                Demo default token: <code className="text-brand-accent-pink">upasyo2026</code>
              </p> */}
            </div>

            {authError && (
              <p className="text-xs text-red-500 font-mono text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-sm rounded-xl py-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              Unlock Dashboard Core
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-brand-dark-card border border-zinc-200/60 dark:border-zinc-900 rounded-2xl shadow-2xl p-6 sm:p-8" id="admin-dashboard-panel">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono uppercase tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-brand-accent-pink" /> UPASYO_CMS_CORE
          </h2>
          <p className="text-xs text-gray-500 font-mono">DYNAMIC FIREBASE TELEMETRY AND KNOWLEDGE RETRIEVAL PANEL</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {activeTab !== "messages" && (
            <button
              onClick={() => setActiveTab("messages")}
              className="flex items-center gap-1.5 text-xs font-mono bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              VIEW_MESSAGES
            </button>
          )}
          <button 
            onClick={handleResetDatabase}
            disabled={isResetting}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg cursor-pointer transition-all ${
              confirmReset
                ? "bg-red-650 text-white border border-red-700 hover:bg-red-700 animate-pulse font-bold"
                : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/50 hover:bg-red-100/50"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            {confirmReset ? "SURE? TAP AGAIN TO SEED" : "RESET_DB_DEFAULT"}
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-1.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            DISCONNECT
          </button>
        </div>
      </div>

      {actionStatus.type && (
        <div className={`p-4 mb-6 rounded-xl border font-mono text-xs flex items-center justify-between transition-all ${
          actionStatus.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-950/30 border-red-200/50 dark:border-red-900 text-red-800 dark:text-red-300"
        }`}>
          <span>{actionStatus.message}</span>
          <button onClick={() => setActionStatus({ type: null, message: "" })} className="p-0.5 hover:opacity-75 cursor-pointer">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-6">
        {[
          { id: "settings", label: "METADATA", icon: Settings },
          { id: "hero", label: "BIOGRAPHY", icon: User },
          { id: "research", label: "RESEARCH", icon: Cpu },
          { id: "projects", label: "PROJECTS", icon: FolderGit2 },
          { id: "pubs", label: "PAPERS", icon: BookOpen },
          { id: "achievements", label: "BENCHMARKS", icon: Award },
          { id: "blog", label: "RESEARCH_BLOG", icon: FileText },
          { id: "knowledge", label: "AI_RAG_FACTS", icon: Brain },
          { id: "messages", label: "FORM_MESSAGES", icon: MessageSquare },
          { id: "links", label: "BUTTON_LINKS", icon: Edit2 },
          { id: "animations", label: "ANIMATIONS", icon: RefreshCw }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-slate-900 dark:bg-pink-100 text-white dark:text-slate-950" 
                  : "text-gray-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels content */}
      <div className="space-y-6">
        {/* TAB 1: Global site configuration metadata */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300">GLOBAL APP COMPILER SETTINGS</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">Configure foundational parameters and telemetry settings.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1">BRAND NAME</label>
                <input
                  type="text"
                  value={siteSettings.brandName || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, brandName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1">CORE LOGO STYLE</label>
                <input
                  type="text"
                  value={siteSettings.logoStyle || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, logoStyle: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-gray-500 mb-1">FOOTER TEXT CREDITS</label>
                <input
                  type="text"
                  value={siteSettings.footerText || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, footerText: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-gray-500 mb-1">TECHNICAL TICKER WORDS (Comma Separated)</label>
                <textarea
                  rows={2}
                  value={siteSettings.tickerText || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tickerText: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white font-mono"
                  placeholder="ARTIFICIAL GENERAL INTELLIGENCE, NEURO-SYMBOLIC REASONING, ..."
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1">FACTUAL ACCURACY METRIC</label>
                <input
                  type="text"
                  value={siteSettings.factualAccuracy || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, factualAccuracy: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white font-mono"
                  placeholder="99.8%"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1">STORAGE ONLINE STATUS</label>
                <input
                  type="text"
                  value={siteSettings.storageStatus || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, storageStatus: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white font-mono"
                  placeholder="ONLINE"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1">SYSTEM STATE STATUS</label>
                <input
                  type="text"
                  value={siteSettings.systemState || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, systemState: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white font-mono"
                  placeholder="SAFE_COEXISTENCE"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1">PORT ENTRY NUMBER</label>
                <input
                  type="text"
                  value={siteSettings.portEntry || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, portEntry: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white font-mono"
                  placeholder="3000"
                />
              </div>
            </div>

            {/* BACKGROUND VIDEO SETTINGS */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-pink-500 animate-pulse" />
                <h4 className="text-xs font-mono font-bold text-gray-700 dark:text-pink-300 uppercase">SWISS ALPS BACKGROUND VIDEO DEPLOYMENT</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans">
                Deploy and configure high-definition looping scenic background animations. Updates instantly re-compile the landing portal layer.
              </p>
              
              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-gray-500 dark:text-pink-300 font-semibold mb-1">BACKGROUND VIDEO DIRECT MP4 SOURCE URL</label>
                    <input
                      type="text"
                      placeholder="e.g., https://assets.mixkit.co/.../video.mp4"
                      value={siteSettings.backgroundVideoUrl || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, backgroundVideoUrl: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono dark:text-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 select-none pt-2">
                    <input
                      type="checkbox"
                      id="enable-bg-video-chk"
                      checked={siteSettings.enableBackgroundVideo !== false}
                      onChange={(e) => setSiteSettings({ ...siteSettings, enableBackgroundVideo: e.target.checked })}
                      className="rounded accent-pink-500 cursor-pointer w-4 h-4"
                    />
                    <label htmlFor="enable-bg-video-chk" className="text-xs font-mono font-bold text-gray-700 dark:text-pink-300 cursor-pointer">
                      Enable Backplane Video Stream
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSiteSettings({
                        ...siteSettings,
                        backgroundVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-covered-in-snow-with-falling-flakes-38556-large.mp4",
                        enableBackgroundVideo: true
                      });
                      triggerStatus("success", "Loaded Swiss Alps falling snow preset parameters. Click compile below to save!");
                    }}
                    className="bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold font-mono px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Load Swiss Alps Snow Preset
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSiteSettings({
                        ...siteSettings,
                        backgroundVideoUrl: "",
                        enableBackgroundVideo: false
                      });
                      triggerStatus("success", "Cleared background video and disabled playback. Click compile below to save!");
                    }}
                    className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-bold font-mono px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete Background Video Configuration
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-4">
              <h4 className="text-xs font-mono font-bold text-gray-700 dark:text-zinc-300">SOCIAL TELEMETRY NETWORKS</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">LINKEDIN URL</label>
                  <input
                    type="text"
                    value={siteSettings.linkedinUrl || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, linkedinUrl: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">GITHUB URL</label>
                  <input
                    type="text"
                    value={siteSettings.githubUrl || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, githubUrl: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">FACEBOOK URL</label>
                  <input
                    type="text"
                    value={siteSettings.facebookUrl || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">INSTAGRAM URL</label>
                  <input
                    type="text"
                    value={siteSettings.instagramUrl || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-gray-500 mb-1">WHATSAPP LINK / NUMBER</label>
                  <input
                    type="text"
                    value={siteSettings.whatsappUrl || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsappUrl: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                    placeholder="https://wa.me/..."
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 bg-pink-200 text-gray-950 font-bold px-5 py-3 rounded-xl cursor-pointer hover:bg-pink-300 transition-colors"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              COMPILE GLOBAL PARAMETERS
            </button>
          </div>
        )}

        {/* TAB 2: Hero Section details */}
        {activeTab === "hero" && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300">HERO BRAND & BIO WRITER</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">HERO DISPLAY TITLE</label>
                  <input
                    type="text"
                    value={hero.title || ""}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">SCIENTIFIC SUBTITLE ROLE</label>
                  <input
                    type="text"
                    value={hero.subtitle || ""}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-gray-500 mb-1">PROFILE PHOTO URL (EDITABLE INSTANTLY)</label>
                  <input
                    type="text"
                    value={hero.profileImage || ""}
                    onChange={(e) => setHero({ ...hero, profileImage: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono text-gray-500 mb-1">SUMMARY SYNOPSIS DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={hero.description || ""}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <h4 className="text-xs font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase mb-2">ABOUT DETAILED BIO</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1">LONG BIO NARRATIVE</label>
                    <textarea
                      rows={4}
                      value={about.bio || ""}
                      onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1">SCIENTIFIC DISCIPLINE SKILLS (Comma Separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(about.skills) ? about.skills.join(", ") : ""}
                      onChange={(e) => setAbout({ ...about, skills: e.target.value.split(",").map(s => s.trim()) })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 bg-pink-200 text-gray-950 font-bold px-5 py-3 rounded-xl cursor-pointer hover:bg-pink-300 transition-colors"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              SAVE BIO PARAMETERS
            </button>
          </div>
        )}

        {/* TAB 3: Research Section and areas */}
        {activeTab === "research" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300">RESEARCH GENERAL VISION</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">VISION TITLE</label>
                  <input
                    type="text"
                    value={researchVision.title || ""}
                    onChange={(e) => setResearchVision({ ...researchVision, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">VISION SEGMENT 1</label>
                  <textarea
                    rows={3}
                    value={researchVision.paragraph1 || ""}
                    onChange={(e) => setResearchVision({ ...researchVision, paragraph1: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 mb-1">VISION SEGMENT 2</label>
                  <textarea
                    rows={3}
                    value={researchVision.paragraph2 || ""}
                    onChange={(e) => setResearchVision({ ...researchVision, paragraph2: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm dark:text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 bg-pink-200 text-gray-950 font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:bg-pink-300 transition-colors"
              >
                SAVE VISION
              </button>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-4">
              <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300">CORE RESEARCH FIELDS</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {researchAreas.map((area) => (
                  <div key={area.id} className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 flex justify-between items-start">
                    <div>
                      <h4 className="font-mono text-xs font-bold text-gray-900 dark:text-white">{area.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{area.description}</p>
                      <div className="flex gap-2 mt-2 font-mono text-[10px]">
                        <span className="text-zinc-400">ICON: {area.icon}</span>
                        <span className="text-zinc-400">ORDER: {area.order}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(COLLECTIONS.RESEARCH_AREAS, area.id)}
                      className={getDeleteBtnClass(COLLECTIONS.RESEARCH_AREAS, area.id)}
                    >
                      {pendingDeleteId === `${COLLECTIONS.RESEARCH_AREAS}_${area.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <div className="bg-brand-cream/20 border border-pink-100/30 p-4 rounded-xl space-y-3">
                <p className="text-xs font-mono font-bold text-brand-accent-pink">ADD RESEARCH DEPLOYMENT AREA</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Area Title..."
                    value={newArea.title}
                    onChange={(e) => setNewArea({ ...newArea, title: e.target.value })}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 px-3 py-2 text-sm rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Description..."
                    value={newArea.description}
                    onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 px-3 py-2 text-sm rounded-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Icon layout..."
                      value={newArea.icon}
                      onChange={(e) => setNewArea({ ...newArea, icon: e.target.value })}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 px-3 py-2 text-sm rounded-lg"
                    />
                    <button
                      onClick={handleAddResearchArea}
                      className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 px-3.5 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Projects Edit panel */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">ACTIVE COGNITIVE PROJECTS</h3>
            
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex justify-between items-start">
                  <div>
                    <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {proj.title} <span className="text-xs text-gray-400 font-normal">({proj.subtitle})</span>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {proj.tags?.map((t: string) => (
                        <span key={t} className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-850 text-gray-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs font-mono text-brand-accent-pink mt-2">IMPACT: {proj.impact}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(COLLECTIONS.PROJECTS, proj.id)}
                    className={getDeleteBtnClass(COLLECTIONS.PROJECTS, proj.id)}
                  >
                    {pendingDeleteId === `${COLLECTIONS.PROJECTS}_${proj.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-brand-cream/20 border border-pink-100/30 p-4 rounded-xl space-y-3">
              <p className="text-xs font-mono font-bold text-brand-accent-pink uppercase">ADD RESEARCH PROJECT SCHEMATIC</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Project Title..."
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Subtitle (e.g. Scaling Compiler)..."
                  value={newProject.subtitle}
                  onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)..."
                  value={newProject.tags}
                  onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg col-span-2"
                />
                <div className="col-span-2">
                  <textarea
                    rows={2}
                    placeholder="Broad functional description..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Scientific impact results (metrics)..."
                  value={newProject.impact}
                  onChange={(e) => setNewProject({ ...newProject, impact: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg col-span-2"
                />
                <input
                  type="text"
                  placeholder="GitHub links (URL)..."
                  value={newProject.github}
                  onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Demo links (URL)..."
                  value={newProject.demo}
                  onChange={(e) => setNewProject({ ...newProject, demo: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
              </div>
              <button
                onClick={handleAddProject}
                className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                COMPILE SYSTEM PROJECT
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Publications Section */}
        {activeTab === "pubs" && (
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">BIBLIOGRAPHY & PAPERS</h3>
            
            <div className="space-y-4">
              {publications.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex justify-between items-start">
                  <div>
                    <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-white">"{p.title}"</h4>
                    <p className="text-xs text-gray-400 mt-1">AUTHORS: {p.authors}</p>
                    <p className="text-xs font-semibold text-brand-accent-pink mt-1">{p.venue} · {p.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(COLLECTIONS.PUBLICATIONS, p.id)}
                    className={getDeleteBtnClass(COLLECTIONS.PUBLICATIONS, p.id)}
                  >
                    {pendingDeleteId === `${COLLECTIONS.PUBLICATIONS}_${p.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-brand-cream/20 border border-pink-100/30 p-4 rounded-xl space-y-3">
              <p className="text-xs font-mono font-bold text-brand-accent-pink uppercase">ADD SCIENTIFIC RECOGNITION PAPER</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Paper Title..."
                  value={newPub.title}
                  onChange={(e) => setNewPub({ ...newPub, title: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg col-span-2"
                />
                <input
                  type="text"
                  placeholder="Authors (e.g. Upasyo, Vance)..."
                  value={newPub.authors}
                  onChange={(e) => setNewPub({ ...newPub, authors: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Conference venue (e.g. NeurIPS)..."
                  value={newPub.venue}
                  onChange={(e) => setNewPub({ ...newPub, venue: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="PDF Link / DOI..."
                  value={newPub.url}
                  onChange={(e) => setNewPub({ ...newPub, url: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Date published (e.g. 2026-05)..."
                  value={newPub.date}
                  onChange={(e) => setNewPub({ ...newPub, date: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
              </div>
              <button
                onClick={handleAddPublication}
                className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                PUBLISH PAPER ENTRY
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: Achievements Section */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">ACCOLADES & MILESTONES</h3>
            
            <div className="space-y-4">
              {achievements.map((a) => (
                <div key={a.id} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex justify-between items-start">
                  <div>
                    <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-white">{a.title}</h4>
                    <p className="text-xs text-brand-accent-pink font-semibold mt-0.5">ISSUED BY: {a.issuer}</p>
                    <p className="text-xs text-gray-500 mt-1">{a.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(COLLECTIONS.ACHIEVEMENTS, a.id)}
                    className={getDeleteBtnClass(COLLECTIONS.ACHIEVEMENTS, a.id)}
                  >
                    {pendingDeleteId === `${COLLECTIONS.ACHIEVEMENTS}_${a.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-brand-cream/20 border border-pink-100/30 p-4 rounded-xl space-y-3">
              <p className="text-xs font-mono font-bold text-brand-accent-pink uppercase">ADD SCIENTIFIC HIGH LEVEL BENCHMARK</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Achievement Citation (e.g. Top Reviewer)..."
                  value={newAch.title}
                  onChange={(e) => setNewAch({ ...newAch, title: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Issuing Assembly (e.g. IEEE Board)..."
                  value={newAch.issuer}
                  onChange={(e) => setNewAch({ ...newAch, issuer: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Brief impact details..."
                    value={newAch.description}
                    onChange={(e) => setNewAch({ ...newAch, description: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={handleAddAchievement}
                className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                RECORD BENCHMARK
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: Blog list management */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">RESEARCH ARTICLES</h3>
            
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div key={post.id} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex justify-between items-start">
                  <div>
                    <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-white">{post.title}</h4>
                    <p className="text-[10px] bg-pink-100 dark:bg-zinc-800 text-brand-accent-pink px-2 py-0.5 rounded inline-block mt-1 font-mono">{post.category}</p>
                    <p className="text-xs text-gray-500 mt-1">{post.summary}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-mono">READ TIME: {post.readingTime} · DATE: {post.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(COLLECTIONS.BLOG_POSTS, post.id)}
                    className={getDeleteBtnClass(COLLECTIONS.BLOG_POSTS, post.id)}
                  >
                    {pendingDeleteId === `${COLLECTIONS.BLOG_POSTS}_${post.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-brand-cream/20 border border-pink-100/30 p-4 rounded-xl space-y-3">
              <p className="text-xs font-mono font-bold text-brand-accent-pink uppercase">COMPILE NEW RESEARCH BLOG PAPER</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Article Title..."
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg col-span-2"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Deep Learning)..."
                  value={newBlog.category}
                  onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Reading timeframe (e.g. 5 min)..."
                  value={newBlog.readingTime}
                  onChange={(e) => setNewBlog({ ...newBlog, readingTime: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Display Illustration URL (Editable instantly)..."
                  value={newBlog.image}
                  onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg col-span-2 font-mono"
                />
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Short summary synopsis..."
                    value={newBlog.summary}
                    onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">MARKDOWN BODY CONTENT</label>
                  <textarea
                    rows={6}
                    placeholder="# Double weight predictive logic... Use markdown syntax"
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs font-mono rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={handleAddBlogPost}
                className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                POST RESEARCH ARTICLE
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: Knowledge Base Facts details for RAG */}
        {activeTab === "knowledge" && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-zinc-900/40 p-4 border border-blue-200/40 dark:border-zinc-800 rounded-xl">
              <h4 className="text-xs font-bold font-mono text-blue-700 dark:text-blue-400 flex items-center gap-1 uppercase mb-1">
                <Brain className="w-4.5 h-4.5" /> RAG SYSTEM MATRIX NOTE
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                The AI Assistant (running on the backend Gemini models) reads this collection as context before generating replies. Modifying or training these entries lets you instruct the AI dynamically on UPASYO's bibliography without recompiling code!
              </p>
            </div>

            <div className="space-y-3">
              {knowledgeBase.map((k) => (
                <div key={k.id} className="p-4 bg-slate-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-pink-100 dark:bg-zinc-800 text-brand-accent-pink px-1.5 py-0.5 rounded uppercase">
                      {k.category || "General"}
                    </span>
                    <p className="text-xs text-gray-700 dark:text-zinc-300 mt-2 italic">"{k.content}"</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(COLLECTIONS.KNOWLEDGE_BASE, k.id)}
                    className={getDeleteBtnClass(COLLECTIONS.KNOWLEDGE_BASE, k.id)}
                  >
                    {pendingDeleteId === `${COLLECTIONS.KNOWLEDGE_BASE}_${k.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-brand-cream/20 border border-pink-100/30 p-4 rounded-xl space-y-3">
              <p className="text-xs font-mono font-bold text-brand-accent-pink uppercase">TRAIN ASSOCIATIVE AGENT CHUNK</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Context Category (e.g. Philosophy, Papers)..."
                  value={newKb.category}
                  onChange={(e) => setNewKb({ ...newKb, category: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg"
                />
                <input
                  type="text"
                  placeholder="RAG Document Content fact..."
                  value={newKb.content}
                  onChange={(e) => setNewKb({ ...newKb, content: e.target.value })}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-sm rounded-lg col-span-2"
                />
              </div>
              <button
                onClick={handleAddKnowledge}
                className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                LOAD FACT CHUNK
              </button>
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-8">
            {/* Core Buttons on the Live Site */}
            <div className="bg-slate-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-6 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base font-mono font-bold text-gray-800 dark:text-zinc-200 uppercase">Core Live Site Buttons</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans mt-0.5">Customize names, links, and background colors of the standard site buttons.</p>
                </div>
                <button
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await updateOrCreateDoc(COLLECTIONS.SITE_SETTINGS, "default", siteSettings);
                      onSettingsSaved();
                      triggerStatus("success", "Core buttons configured successfully in Firestore.");
                    } catch (err) {
                      triggerStatus("error", "Failed to save core button configurations.");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-mono font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  SAVE BUTTONS CONFIG
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Hero Collab Button */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150/50 dark:border-zinc-850 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-pink-500 uppercase">Button 1: Hero Primary Action (Deploy Collab)</h4>
                    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${siteSettings.buttons?.collab?.enabled !== false ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}>
                      {siteSettings.buttons?.collab?.enabled !== false ? "ACTIVE" : "HIDDEN / DELETED"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Name / Label</label>
                      <input
                        type="text"
                        value={siteSettings.buttons?.collab?.name || ""}
                        onChange={(e) => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.collab) updated.buttons.collab = {};
                          updated.buttons.collab.name = e.target.value;
                          setSiteSettings(updated);
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Link Address (URL / Anchor)</label>
                      <input
                        type="text"
                        value={siteSettings.buttons?.collab?.url || ""}
                        onChange={(e) => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.collab) updated.buttons.collab = {};
                          updated.buttons.collab.url = e.target.value;
                          setSiteSettings(updated);
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Color (HEX)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={siteSettings.buttons?.collab?.color || "#18181b"}
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.collab) updated.buttons.collab = {};
                            updated.buttons.collab.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="w-10 h-8 cursor-pointer rounded-lg bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={siteSettings.buttons?.collab?.color || ""}
                          placeholder="e.g. #e11d48"
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.collab) updated.buttons.collab = {};
                            updated.buttons.collab.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                        />
                      </div>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.collab) updated.buttons.collab = {};
                          updated.buttons.collab.enabled = updated.buttons.collab.enabled === false ? true : false;
                          setSiteSettings(updated);
                        }}
                        className={`w-full text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                          siteSettings.buttons?.collab?.enabled !== false 
                            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30" 
                            : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {siteSettings.buttons?.collab?.enabled !== false ? "DELETE / HIDE BUTTON" : "RESTORE / ACTIVATE BUTTON"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Hero Resume Button */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150/50 dark:border-zinc-850 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-pink-500 uppercase">Button 2: Hero Secondary Action (Download Resume)</h4>
                    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${siteSettings.buttons?.resume?.enabled !== false ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}>
                      {siteSettings.buttons?.resume?.enabled !== false ? "ACTIVE" : "HIDDEN / DELETED"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Name / Label</label>
                      <input
                        type="text"
                        value={siteSettings.buttons?.resume?.name || ""}
                        onChange={(e) => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.resume) updated.buttons.resume = {};
                          updated.buttons.resume.name = e.target.value;
                          setSiteSettings(updated);
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Link Address (URL / Anchor)</label>
                      <input
                        type="text"
                        value={siteSettings.buttons?.resume?.url || ""}
                        onChange={(e) => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.resume) updated.buttons.resume = {};
                          updated.buttons.resume.url = e.target.value;
                          setSiteSettings(updated);
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Color (HEX)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={siteSettings.buttons?.resume?.color || "#ffffff"}
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.resume) updated.buttons.resume = {};
                            updated.buttons.resume.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="w-10 h-8 cursor-pointer rounded-lg bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={siteSettings.buttons?.resume?.color || ""}
                          placeholder="e.g. #ffffff"
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.resume) updated.buttons.resume = {};
                            updated.buttons.resume.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                        />
                      </div>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.resume) updated.buttons.resume = {};
                          updated.buttons.resume.enabled = updated.buttons.resume.enabled === false ? true : false;
                          setSiteSettings(updated);
                        }}
                        className={`w-full text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                          siteSettings.buttons?.resume?.enabled !== false 
                            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30" 
                            : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {siteSettings.buttons?.resume?.enabled !== false ? "DELETE / HIDE BUTTON" : "RESTORE / ACTIVATE BUTTON"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Submit Contact Form Button */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150/50 dark:border-zinc-850 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-pink-500 uppercase">Button 3: Contact Form Submit</h4>
                    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${siteSettings.buttons?.inquiry?.enabled !== false ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}>
                      {siteSettings.buttons?.inquiry?.enabled !== false ? "ACTIVE" : "HIDDEN / DELETED"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Name / Label</label>
                      <input
                        type="text"
                        value={siteSettings.buttons?.inquiry?.name || ""}
                        onChange={(e) => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.inquiry) updated.buttons.inquiry = {};
                          updated.buttons.inquiry.name = e.target.value;
                          setSiteSettings(updated);
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Link Address (URL)</label>
                      <input
                        type="text"
                        disabled
                        value="Not applicable (Form Submit action)"
                        className="w-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg text-zinc-400 dark:text-zinc-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Color (HEX)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={siteSettings.buttons?.inquiry?.color || "#18181b"}
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.inquiry) updated.buttons.inquiry = {};
                            updated.buttons.inquiry.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="w-10 h-8 cursor-pointer rounded-lg bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={siteSettings.buttons?.inquiry?.color || ""}
                          placeholder="e.g. #e11d48"
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.inquiry) updated.buttons.inquiry = {};
                            updated.buttons.inquiry.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                        />
                      </div>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.inquiry) updated.buttons.inquiry = {};
                          updated.buttons.inquiry.enabled = updated.buttons.inquiry.enabled === false ? true : false;
                          setSiteSettings(updated);
                        }}
                        className={`w-full text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                          siteSettings.buttons?.inquiry?.enabled !== false 
                            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30" 
                            : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {siteSettings.buttons?.inquiry?.enabled !== false ? "DELETE / HIDE BUTTON" : "RESTORE / ACTIVATE BUTTON"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Cite Abstract Button */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150/50 dark:border-zinc-850 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-pink-500 uppercase">Button 4: Cite Abstract</h4>
                    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${siteSettings.buttons?.citeAbs?.enabled !== false ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}>
                      {siteSettings.buttons?.citeAbs?.enabled !== false ? "ACTIVE" : "HIDDEN / DELETED"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Name / Label</label>
                      <input
                        type="text"
                        value={siteSettings.buttons?.citeAbs?.name || ""}
                        onChange={(e) => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.citeAbs) updated.buttons.citeAbs = {};
                          updated.buttons.citeAbs.name = e.target.value;
                          setSiteSettings(updated);
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Link Address (URL)</label>
                      <input
                        type="text"
                        disabled
                        value="Not applicable (Dynamic per paper)"
                        className="w-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg text-zinc-400 dark:text-zinc-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Color (HEX)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={siteSettings.buttons?.citeAbs?.color || "#ffffff"}
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.citeAbs) updated.buttons.citeAbs = {};
                            updated.buttons.citeAbs.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="w-10 h-8 cursor-pointer rounded-lg bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={siteSettings.buttons?.citeAbs?.color || ""}
                          placeholder="e.g. #f472b6"
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.citeAbs) updated.buttons.citeAbs = {};
                            updated.buttons.citeAbs.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                        />
                      </div>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.citeAbs) updated.buttons.citeAbs = {};
                          updated.buttons.citeAbs.enabled = updated.buttons.citeAbs.enabled === false ? true : false;
                          setSiteSettings(updated);
                        }}
                        className={`w-full text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                          siteSettings.buttons?.citeAbs?.enabled !== false 
                            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30" 
                            : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {siteSettings.buttons?.citeAbs?.enabled !== false ? "DELETE / HIDE BUTTON" : "RESTORE / ACTIVATE BUTTON"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Read Research Button */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150/50 dark:border-zinc-850 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-mono font-bold text-pink-500 uppercase">Button 5: Blog Article Read</h4>
                    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${siteSettings.buttons?.readResearch?.enabled !== false ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}>
                      {siteSettings.buttons?.readResearch?.enabled !== false ? "ACTIVE" : "HIDDEN / DELETED"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Name / Label</label>
                      <input
                        type="text"
                        value={siteSettings.buttons?.readResearch?.name || ""}
                        onChange={(e) => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.readResearch) updated.buttons.readResearch = {};
                          updated.buttons.readResearch.name = e.target.value;
                          setSiteSettings(updated);
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Link Address (URL)</label>
                      <input
                        type="text"
                        disabled
                        value="Not applicable (Opens research modal)"
                        className="w-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg text-zinc-400 dark:text-zinc-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Button Color / Accent Text Highlight (HEX)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={siteSettings.buttons?.readResearch?.color || "#e11d48"}
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.readResearch) updated.buttons.readResearch = {};
                            updated.buttons.readResearch.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="w-10 h-8 cursor-pointer rounded-lg bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={siteSettings.buttons?.readResearch?.color || ""}
                          placeholder="e.g. #f472b6"
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.readResearch) updated.buttons.readResearch = {};
                            updated.buttons.readResearch.color = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                        />
                      </div>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...siteSettings };
                          if (!updated.buttons) updated.buttons = {};
                          if (!updated.buttons.readResearch) updated.buttons.readResearch = {};
                          updated.buttons.readResearch.enabled = updated.buttons.readResearch.enabled === false ? true : false;
                          setSiteSettings(updated);
                        }}
                        className={`w-full text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                          siteSettings.buttons?.readResearch?.enabled !== false 
                            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30" 
                            : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {siteSettings.buttons?.readResearch?.enabled !== false ? "DELETE / HIDE BUTTON" : "RESTORE / ACTIVATE BUTTON"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6 & 7. Portal and Dismiss Action Buttons */}
                <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150/50 dark:border-zinc-850 space-y-3 md:col-span-2 shadow-xs">
                  <div className="flex flex-wrap justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 gap-2">
                    <h4 className="text-xs font-mono font-bold text-pink-500 uppercase">Buttons 6 & 7: Portal Action Buttons</h4>
                    <div className="flex gap-2">
                      <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${siteSettings.buttons?.resetPortal?.enabled !== false ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}>
                        RESET: {siteSettings.buttons?.resetPortal?.enabled !== false ? "ACTIVE" : "HIDDEN"}
                      </span>
                      <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${siteSettings.buttons?.dismissArticle?.enabled !== false ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}>
                        DISMISS: {siteSettings.buttons?.dismissArticle?.enabled !== false ? "ACTIVE" : "HIDDEN"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase">Reset Portal Button Name</label>
                        <input
                          type="text"
                          value={siteSettings.buttons?.resetPortal?.name || ""}
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.resetPortal) updated.buttons.resetPortal = {};
                            updated.buttons.resetPortal.name = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase">Reset Portal Button Color (HEX)</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={siteSettings.buttons?.resetPortal?.color || "#ffffff"}
                            onChange={(e) => {
                              const updated = { ...siteSettings };
                              if (!updated.buttons) updated.buttons = {};
                              if (!updated.buttons.resetPortal) updated.buttons.resetPortal = {};
                              updated.buttons.resetPortal.color = e.target.value;
                              setSiteSettings(updated);
                            }}
                            className="w-10 h-8 cursor-pointer rounded-lg bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={siteSettings.buttons?.resetPortal?.color || ""}
                            placeholder="e.g. #e11d48"
                            onChange={(e) => {
                              const updated = { ...siteSettings };
                              if (!updated.buttons) updated.buttons = {};
                              if (!updated.buttons.resetPortal) updated.buttons.resetPortal = {};
                              updated.buttons.resetPortal.color = e.target.value;
                              setSiteSettings(updated);
                            }}
                            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                          />
                        </div>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.resetPortal) updated.buttons.resetPortal = {};
                            updated.buttons.resetPortal.enabled = updated.buttons.resetPortal.enabled === false ? true : false;
                            setSiteSettings(updated);
                          }}
                          className={`w-full text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                            siteSettings.buttons?.resetPortal?.enabled !== false 
                              ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30" 
                              : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {siteSettings.buttons?.resetPortal?.enabled !== false ? "DELETE / HIDE BUTTON" : "RESTORE / ACTIVATE BUTTON"}
                        </button>
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase">Dismiss Article Button Name</label>
                        <input
                          type="text"
                          value={siteSettings.buttons?.dismissArticle?.name || ""}
                          onChange={(e) => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.dismissArticle) updated.buttons.dismissArticle = {};
                            updated.buttons.dismissArticle.name = e.target.value;
                            setSiteSettings(updated);
                          }}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-400 uppercase">Dismiss Article Button Color (HEX)</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={siteSettings.buttons?.dismissArticle?.color || "#ffffff"}
                            onChange={(e) => {
                              const updated = { ...siteSettings };
                              if (!updated.buttons) updated.buttons = {};
                              if (!updated.buttons.dismissArticle) updated.buttons.dismissArticle = {};
                              updated.buttons.dismissArticle.color = e.target.value;
                              setSiteSettings(updated);
                            }}
                            className="w-10 h-8 cursor-pointer rounded-lg bg-transparent border-0"
                          />
                          <input
                            type="text"
                            value={siteSettings.buttons?.dismissArticle?.color || ""}
                            placeholder="e.g. #18181b"
                            onChange={(e) => {
                              const updated = { ...siteSettings };
                              if (!updated.buttons) updated.buttons = {};
                              if (!updated.buttons.dismissArticle) updated.buttons.dismissArticle = {};
                              updated.buttons.dismissArticle.color = e.target.value;
                              setSiteSettings(updated);
                            }}
                            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                          />
                        </div>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...siteSettings };
                            if (!updated.buttons) updated.buttons = {};
                            if (!updated.buttons.dismissArticle) updated.buttons.dismissArticle = {};
                            updated.buttons.dismissArticle.enabled = updated.buttons.dismissArticle.enabled === false ? true : false;
                            setSiteSettings(updated);
                          }}
                          className={`w-full text-[10px] font-mono font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                            siteSettings.buttons?.dismissArticle?.enabled !== false 
                              ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 dark:border-red-900/30" 
                              : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {siteSettings.buttons?.dismissArticle?.enabled !== false ? "DELETE / HIDE BUTTON" : "RESTORE / ACTIVATE BUTTON"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Dynamic Button Links */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 space-y-4">
              <div>
                <h3 className="text-base font-mono font-bold text-gray-800 dark:text-zinc-200 uppercase">Custom Action Button Links</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-sans mt-0.5">Add or edit completely customized action buttons that appear under the main Hero section of the live site.</p>
              </div>

              {links.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {links.map((link) => (
                    <div key={link.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex items-center justify-between shadow-xs">
                      <div>
                        <p className="font-mono text-sm font-bold">{link.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{link.url}</p>
                        <div className="w-4 h-4 rounded-full mt-1 border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: link.color }} />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingLinkId(link.id);
                            setNewLink({ name: link.name, url: link.url, color: link.color });
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(COLLECTIONS.BUTTON_LINKS, link.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                        >
                          {pendingDeleteId === `${COLLECTIONS.BUTTON_LINKS}_${link.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-brand-cream/20 border border-pink-100/30 p-5 rounded-2xl space-y-3">
                <p className="text-xs font-mono font-bold text-brand-accent-pink uppercase">{editingLinkId ? "EDITING CUSTOM LINK" : "ADD NEW CUSTOM LINK"}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Button Label Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Visit Lab Site"
                      value={newLink.name}
                      onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Button URL Address</label>
                    <input
                      type="text"
                      placeholder="e.g. https://lab.ai"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">Button Color (HEX)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newLink.color}
                        onChange={(e) => setNewLink({ ...newLink, color: e.target.value })}
                        className="h-9 w-10 cursor-pointer rounded-lg bg-transparent border-0"
                      />
                      <input
                        type="text"
                        placeholder="#e11d48"
                        value={newLink.color}
                        onChange={(e) => setNewLink({ ...newLink, color: e.target.value })}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveLink}
                    className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {editingLinkId ? "UPDATE LINK" : "ADD BUTTON LINK"}
                  </button>
                  {editingLinkId && (
                    <button
                      onClick={() => { setEditingLinkId(null); setNewLink({ name: "", url: "", color: "#e11d48" }); }}
                      className="bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: View Received Messages */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">CONTACT FORM INBOX Telemetry</h3>
            
            {messages.length === 0 ? (
              <p className="text-xs text-gray-400 font-mono italic text-center p-8 bg-zinc-50 dark:bg-zinc-900 border border-dashed rounded-xl">
                No inbound submissions received yet.
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-white">{msg.subject || "No Subject"}</h4>
                        <p className="text-xs text-gray-400">FROM: <span className="font-semibold text-gray-700 dark:text-zinc-300">{msg.name}</span> ({msg.email})</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 leading-relaxed italic">
                      "{msg.message}"
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDeleteItem(COLLECTIONS.CONTACT_MESSAGES, msg.id)}
                        className={getDeleteBtnClass(COLLECTIONS.CONTACT_MESSAGES, msg.id)}
                      >
                        {pendingDeleteId === `${COLLECTIONS.CONTACT_MESSAGES}_${msg.id}` ? "SURE?" : <Trash2 className="w-3" />}
                        DELETE_MESSAGE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: Dynamic Scroll Animations Controller */}
        {activeTab === "animations" && (
          <div className="space-y-8">
            <div className="bg-pink-50 dark:bg-zinc-900/40 p-4 border border-pink-200/40 dark:border-zinc-800 rounded-xl">
              <h4 className="text-xs font-bold font-mono text-pink-700 dark:text-brand-accent-pink flex items-center gap-1 uppercase mb-1">
                <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: "12s" }} /> DYNAMIC SCROLL ANIMATIONS ARCHITECTURE
              </h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                Configure Scroll-driven AOS (Framer Motion) entrance effects for your core site components. Changes write immediately to Firestore and synchronize layout attributes dynamically.
              </p>
            </div>

            {animations.filter(a => a.type === "aos").length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">Deployed Animation Registers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animations.filter(a => a.type === "aos").map((anim) => (
                    <div key={anim.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl flex items-start justify-between shadow-xs">
                      <div className="space-y-2">
                        <div>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded mr-2 uppercase bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                            {anim.type}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${anim.enabled !== false ? "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"}`}>
                            {anim.enabled !== false ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                        <p className="font-mono text-sm font-bold">{anim.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">TARGET: <span className="text-zinc-800 dark:text-zinc-300 font-bold">{anim.selector}</span></p>
                        
                        <div className="text-[10px] font-mono text-gray-500 space-y-0.5">
                          <p>EFFECT: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{anim.effect}</span></p>
                          <p>DURATION: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{anim.duration}ms</span> | DELAY: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{anim.delay}ms</span></p>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleEditAnimation(anim)}
                          className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(COLLECTIONS.ANIMATIONS, anim.id)}
                          className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        >
                          {pendingDeleteId === `${COLLECTIONS.ANIMATIONS}_${anim.id}` ? "SURE?" : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-brand-cream/15 border border-zinc-150/50 dark:border-zinc-900 p-6 rounded-2xl space-y-4">
              <p className="text-xs font-mono font-bold text-brand-accent-pink uppercase">{editingAnimationId ? `EDITING REGISTER [${editingAnimationId}]` : "CREATE NEW ANIMATION REGISTER"}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 dark:text-pink-300 font-semibold uppercase mb-1">Animation Name / Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Hero Section Fade Up"
                    value={newAnimation.name}
                    onChange={(e) => setNewAnimation({ ...newAnimation, name: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none focus:border-pink-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 dark:text-pink-300 font-semibold uppercase mb-1">Target Element / Selector Bind</label>
                  <select
                    value={newAnimation.selector}
                    onChange={(e) => setNewAnimation({ ...newAnimation, selector: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none"
                  >
                    <option value="hero-section">Hero Cover Section (hero-section)</option>
                    <option value="about-section">Biography Bio Column (about-section)</option>
                    <option value="research-areas">Research Vision Grid (research-areas)</option>
                    <option value="projects">Projects Portfolio Deck (projects)</option>
                    <option value="publications">Publications Bibliography Shelf (publications)</option>
                    <option value="achievements">Benchmarks Accolades Panel (achievements)</option>
                    <option value="blog">Research Deep Dive Articles (blog)</option>
                    <option value="contact">Collaborative Route Inbox Form (contact)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 dark:text-pink-300 font-semibold uppercase mb-1">AOS Motion Effect</label>
                  <select
                    value={newAnimation.effect}
                    onChange={(e) => setNewAnimation({ ...newAnimation, effect: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white focus:outline-none"
                  >
                    <option value="fade-up">Fade Up (fade-up)</option>
                    <option value="fade-down">Fade Down (fade-down)</option>
                    <option value="fade-left">Fade Left (fade-left)</option>
                    <option value="fade-right">Fade Right (fade-right)</option>
                    <option value="zoom-in">Zoom In (zoom-in)</option>
                    <option value="zoom-out">Zoom Out (zoom-out)</option>
                    <option value="flip-up">Flip Up (flip-up)</option>
                    <option value="flip-down">Flip Down (flip-down)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 dark:text-pink-300 font-semibold uppercase mb-1">Duration (ms)</label>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    value={newAnimation.duration}
                    onChange={(e) => setNewAnimation({ ...newAnimation, duration: parseInt(e.target.value) || 1000 })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 dark:text-pink-300 font-semibold uppercase mb-1">Delay Offset (ms)</label>
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    value={newAnimation.delay}
                    onChange={(e) => setNewAnimation({ ...newAnimation, delay: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/50 px-3 py-2 text-xs rounded-lg dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 select-none md:col-span-2">
                  <input
                    type="checkbox"
                    id="enable-chk"
                    checked={newAnimation.enabled !== false}
                    onChange={(e) => setNewAnimation({ ...newAnimation, enabled: e.target.checked })}
                    className="rounded accent-pink-500 cursor-pointer"
                  />
                  <label htmlFor="enable-chk" className="text-xs font-mono font-bold text-gray-700 dark:text-zinc-300 cursor-pointer">
                    Enable / Active Deploy State
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={editingAnimationId ? handleUpdateAnimation : handleAddAnimation}
                  className="bg-slate-900 dark:bg-white text-white dark:text-gray-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {editingAnimationId ? "UPDATE DEPLOYMENT" : "DEPLOY ANIMATION"}
                </button>
                {editingAnimationId && (
                  <button
                    onClick={handleCancelEditAnimation}
                    className="bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
