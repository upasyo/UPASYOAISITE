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
  FileText
} from "lucide-react";
import { 
  db, 
  COLLECTIONS, 
  fetchDoc, 
  fetchCollection, 
  updateOrCreateDoc, 
  deleteDocument,
  seedDatabaseIfEmpty
} from "../firebase";

interface AdminDashboardProps {
  onSettingsSaved: () => void;
  isDarkMode: boolean;
}

export default function AdminDashboard({ onSettingsSaved, isDarkMode }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"settings" | "hero" | "research" | "projects" | "pubs" | "achievements" | "blog" | "knowledge" | "messages">("settings");
  
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

  // Editing forms state holder (for adds/updates)
  const [newArea, setNewArea] = useState({ title: "", description: "", icon: "Cpu", order: 1 });
  const [newProject, setNewProject] = useState({ title: "", subtitle: "", description: "", tags: "", github: "", demo: "", impact: "", order: 1 });
  const [newPub, setNewPub] = useState({ title: "", authors: "", venue: "", url: "", date: "", order: 1 });
  const [newAch, setNewAch] = useState({ title: "", issuer: "", description: "", order: 1 });
  const [newBlog, setNewBlog] = useState({ title: "", category: "Deep Learning", date: "", readingTime: "5 min", summary: "", content: "", image: "", order: 1 });
  const [newKb, setNewKb] = useState({ content: "", category: "General" });

  const adminPasscode = "upasyo2026"; // Secure default pass

  // Fetch all CMS options
  const loadCmsData = async () => {
    const siteSnap = await fetchDoc(COLLECTIONS.SITE_SETTINGS, "default");
    const heroSnap = await fetchDoc(COLLECTIONS.HERO, "default");
    const aboutSnap = await fetchDoc(COLLECTIONS.ABOUT, "default");
    const visionSnap = await fetchDoc(COLLECTIONS.RESEARCH_VISION, "default");

    if (siteSnap) setSiteSettings(siteSnap);
    if (heroSnap) setHero(heroSnap);
    if (aboutSnap) setAbout(aboutSnap);
    if (visionSnap) setResearchVision(visionSnap);

    // List collections
    const rAreas = await fetchCollection(COLLECTIONS.RESEARCH_AREAS);
    const projs = await fetchCollection(COLLECTIONS.PROJECTS);
    const pubs = await fetchCollection(COLLECTIONS.PUBLICATIONS);
    const achs = await fetchCollection(COLLECTIONS.ACHIEVEMENTS);
    const blogs = await fetchCollection(COLLECTIONS.BLOG_POSTS);
    const kb = await fetchCollection(COLLECTIONS.KNOWLEDGE_BASE);
    const msgs = await fetchCollection(COLLECTIONS.CONTACT_MESSAGES, false);

    setResearchAreas(rAreas);
    setProjects(projs);
    setPublications(pubs);
    setAchievements(achs);
    setBlogPosts(blogs);
    setKnowledgeBase(kb);
    
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
    const itemId = "area_" + Date.now();
    await updateOrCreateDoc(COLLECTIONS.RESEARCH_AREAS, itemId, newArea);
    setNewArea({ title: "", description: "", icon: "Cpu", order: researchAreas.length + 1 });
    loadCmsData();
  };

  const handleAddProject = async () => {
    if (!newProject.title) return;
    const itemId = "proj_" + Date.now();
    const data = {
      ...newProject,
      tags: newProject.tags.split(",").map(t => t.trim()).filter(Boolean)
    };
    await updateOrCreateDoc(COLLECTIONS.PROJECTS, itemId, data);
    setNewProject({ title: "", subtitle: "", description: "", tags: "", github: "", demo: "", impact: "", order: projects.length + 1 });
    loadCmsData();
  };

  const handleAddPublication = async () => {
    if (!newPub.title) return;
    const itemId = "pub_" + Date.now();
    await updateOrCreateDoc(COLLECTIONS.PUBLICATIONS, itemId, newPub);
    setNewPub({ title: "", authors: "", venue: "", url: "", date: "", order: publications.length + 1 });
    loadCmsData();
  };

  const handleAddAchievement = async () => {
    if (!newAch.title) return;
    const itemId = "ach_" + Date.now();
    await updateOrCreateDoc(COLLECTIONS.ACHIEVEMENTS, itemId, newAch);
    setNewAch({ title: "", issuer: "", description: "", order: achievements.length + 1 });
    loadCmsData();
  };

  const handleAddBlogPost = async () => {
    if (!newBlog.title) return;
    const itemId = "blog_" + Date.now();
    await updateOrCreateDoc(COLLECTIONS.BLOG_POSTS, itemId, newBlog);
    setNewBlog({ title: "", category: "Deep Learning", date: new Date().toLocaleDateString(), readingTime: "5 min", summary: "", content: "", image: "", order: blogPosts.length + 1 });
    loadCmsData();
  };

  const handleAddKnowledge = async () => {
    if (!newKb.content) return;
    const itemId = "kb_" + Date.now();
    await updateOrCreateDoc(COLLECTIONS.KNOWLEDGE_BASE, itemId, newKb);
    setNewKb({ content: "", category: "General" });
    loadCmsData();
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
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-1.5 text-center">
                Demo default token: <code className="text-brand-accent-pink">upasyo2026</code>
              </p>
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
          { id: "messages", label: "FORM_MESSAGES", icon: MessageSquare }
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
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300">GLOBAL APP COMPILER SETTINGS</h3>
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
                  <div key={area.id} className="bg-slate-50 dark:bg-zinc-905 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-900 flex justify-between items-start">
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
                <div key={proj.id} className="p-4 bg-slate-50 dark:bg-zinc-905 border border-zinc-200/50 dark:border-zinc-900/55 rounded-xl flex justify-between items-start">
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
                <div key={p.id} className="p-4 bg-slate-50 dark:bg-zinc-905 border border-zinc-200/50 dark:border-zinc-900 rounded-xl flex justify-between items-start">
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
                <div key={a.id} className="p-4 bg-slate-50 dark:bg-zinc-905 border border-zinc-200/50 dark:border-zinc-900 rounded-xl flex justify-between items-start">
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
                <div key={post.id} className="p-4 bg-slate-50 dark:bg-zinc-905 border border-zinc-200/50 dark:border-zinc-900 rounded-xl flex justify-between items-start">
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
                <div key={k.id} className="p-4 bg-slate-50 dark:bg-zinc-905 border border-zinc-200/50 dark:border-zinc-900 rounded-xl flex justify-between items-start">
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

        {/* TAB 9: View Received Messages */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase">CONTACT FORM INBOX Telemetry</h3>
            
            {messages.length === 0 ? (
              <p className="text-xs text-gray-400 font-mono italic text-center p-8 bg-zinc-50 dark:bg-zinc-905 border border-dashed rounded-xl">
                No inbound submissions received yet.
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-5 bg-zinc-50 dark:bg-zinc-905 border border-zinc-200/50 dark:border-zinc-900 rounded-xl space-y-2">
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
      </div>
    </div>
  );
}
