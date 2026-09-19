import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Printer, 
  Linkedin, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Award, 
  BookOpen, 
  Code, 
  GraduationCap, 
  Briefcase, 
  Atom,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Globe,
  MapPin,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  LogOut
} from "lucide-react";
import { 
  ResumeData, 
  DEFAULT_RESUME_DATA, 
  fetchResumeData, 
  saveResumeData,
  isCmsAdminAuthenticated,
  setCmsAdminAuthenticated,
  verifyCmsAdminPasscode,
  CMS_ADMIN_PASSCODE
} from "../firebase";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedinUrl?: string;
  userEmail?: string;
  onDataUpdated?: (data: ResumeData) => void;
  isAdmin?: boolean;
  setIsAdmin?: (admin: boolean) => void;
}

export default function ResumeModal({ 
  isOpen, 
  onClose,
  linkedinUrl = "https://www.linkedin.com/in/upasyokushari/",
  userEmail = "upasyokushari@gmail.com",
  onDataUpdated,
  isAdmin,
  setIsAdmin
}: ResumeModalProps) {
  const [resume, setResume] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Authentication & Passcode Protection State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(isAdmin || isCmsAdminAuthenticated());
  });
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  // Load latest resume data from Firestore / local storage on modal open
  useEffect(() => {
    if (isOpen) {
      const authStatus = Boolean(isAdmin || isCmsAdminAuthenticated());
      setIsAuthenticated(authStatus);
      fetchResumeData().then((data) => {
        if (data) {
          setResume(data);
        }
      });
    } else {
      setIsEditing(false);
      setShowPasscodeModal(false);
      setPasscodeInput("");
      setPasscodeError("");
      setSaveError("");
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Toggle Edit Mode: Guarded strictly by CMS Admin Passcode
  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    const currentAuth = Boolean(isAdmin || isCmsAdminAuthenticated());
    if (currentAuth) {
      setIsAuthenticated(true);
      setIsEditing(true);
    } else {
      setPasscodeInput("");
      setPasscodeError("");
      setShowPasscodeModal(true);
    }
  };

  // Handle Passcode Unlock Verification
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCmsAdminPasscode(passcodeInput)) {
      setIsAuthenticated(true);
      setCmsAdminAuthenticated(true);
      if (setIsAdmin) setIsAdmin(true);
      setShowPasscodeModal(false);
      setPasscodeInput("");
      setPasscodeError("");
      setIsEditing(true);
      setAuthNotice("✓ CMS Admin Passcode Verified. Full CV edit mode enabled.");
      setTimeout(() => setAuthNotice(""), 4500);
    } else {
      setPasscodeError("Access Denied: Incorrect CMS admin passcode. Only the authorized CMS Admin can edit the CV.");
    }
  };

  // Lock Admin Session & Return to Read-Only Mode
  const handleLockSession = () => {
    setIsEditing(false);
    setIsAuthenticated(false);
    setCmsAdminAuthenticated(false);
    if (setIsAdmin) setIsAdmin(false);
    setAuthNotice("CMS Admin session locked. CV is now in protected read-only view.");
    setTimeout(() => setAuthNotice(""), 4500);
  };

  const handleSave = async () => {
    const currentAuth = Boolean(isAdmin || isCmsAdminAuthenticated() || isAuthenticated);
    if (!currentAuth) {
      setSaveError("UNAUTHORIZED: Only person with proper correct passcode of CMS admin can edit and save the CV.");
      setIsEditing(false);
      setShowPasscodeModal(true);
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      await saveResumeData(resume);
      setSaveSuccess(true);
      if (onDataUpdated) onDataUpdated(resume);
      setTimeout(() => setSaveSuccess(false), 3500);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error saving resume:", err);
      setSaveError(err?.message || "Failed to save resume. Proper CMS admin authentication required.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const currentAuth = Boolean(isAdmin || isCmsAdminAuthenticated() || isAuthenticated);
    if (!currentAuth) {
      setShowPasscodeModal(true);
      return;
    }

    if (window.confirm("Are you sure you want to reset the resume to the default baseline?")) {
      setResume({ ...DEFAULT_RESUME_DATA });
      try {
        await saveResumeData(DEFAULT_RESUME_DATA);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err: any) {
        setSaveError(err?.message || "Reset failed. Proper CMS admin passcode required.");
      }
    }
  };

  const handleCopyMarkdown = () => {
    const compText = resume.competencies
      .map((c) => `- **${c.category}:** ${c.skills}`)
      .join("\n");

    const expText = resume.experience
      .map(
        (e) => `### ${e.role}\n**${e.company}** | ${e.period} (${e.location})\n` +
          e.bullets.map((b) => `- ${b}`).join("\n")
      )
      .join("\n\n");

    const eduText = resume.education
      .map((ed) => `**${ed.degree}**\n*${ed.institution}* | ${ed.period}\n${ed.details}`)
      .join("\n\n");

    const pubText = resume.publications
      .map((p, i) => `${i + 1}. **${p.authors}** "${p.title}" *${p.venue}*, ${p.year}. ${p.doiUrl ? `[Link](${p.doiUrl})` : ""}`)
      .join("\n");

    const awText = resume.awards
      .map((a) => `- **${a.title}** (${a.issuer}, ${a.year}): ${a.description}`)
      .join("\n");

    const markdownResume = `# ${resume.name}
**${resume.title}**
*${resume.focus}*

Email: ${resume.email || userEmail} | LinkedIn: ${resume.linkedinUrl || linkedinUrl} | Website: ${resume.websiteUrl} | Location: ${resume.location}

---

## PROFESSIONAL SUMMARY
${resume.summary}

---

## CORE TECHNICAL COMPETENCIES
${compText}

---

## RESEARCH & WORK EXPERIENCE
${expText}

---

## EDUCATION
${eduText}

---

## SELECTED PUBLICATIONS
${pubText}

---

## HONORS & AWARDS
${awText}
`;

    navigator.clipboard.writeText(markdownResume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // State modification helpers for editable mode
  const updateCompetency = (index: number, field: "category" | "skills", val: string) => {
    const updated = [...resume.competencies];
    updated[index] = { ...updated[index], [field]: val };
    setResume({ ...resume, competencies: updated });
  };

  const addCompetency = () => {
    setResume({
      ...resume,
      competencies: [...resume.competencies, { category: "NEW DOMAIN", skills: "Skill 1, Skill 2, Skill 3" }]
    });
  };

  const removeCompetency = (index: number) => {
    setResume({
      ...resume,
      competencies: resume.competencies.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index: number, field: string, val: any) => {
    const updated = [...resume.experience];
    updated[index] = { ...updated[index], [field]: val };
    setResume({ ...resume, experience: updated });
  };

  const addExperienceBullet = (expIndex: number) => {
    const updated = [...resume.experience];
    updated[expIndex].bullets = [...updated[expIndex].bullets, "New research accomplishment or engineering milestone."];
    setResume({ ...resume, experience: updated });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, val: string) => {
    const updated = [...resume.experience];
    const newBullets = [...updated[expIndex].bullets];
    newBullets[bulletIndex] = val;
    updated[expIndex].bullets = newBullets;
    setResume({ ...resume, experience: updated });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...resume.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setResume({ ...resume, experience: updated });
  };

  const addExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        {
          id: `exp_${Date.now()}`,
          role: "Quantum Research Scientist",
          company: "Laboratory / Institute",
          period: "2024 – Present",
          location: "Zurich / Remote",
          bullets: ["Engineered scalable quantum algorithms and performed simulation benchmarks."]
        }
      ]
    });
  };

  const removeExperience = (index: number) => {
    setResume({
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index)
    });
  };

  const updateEducation = (index: number, field: string, val: string) => {
    const updated = [...resume.education];
    updated[index] = { ...updated[index], [field]: val };
    setResume({ ...resume, education: updated });
  };

  const addEducation = () => {
    setResume({
      ...resume,
      education: [
        ...resume.education,
        {
          id: `edu_${Date.now()}`,
          degree: "Degree / Diploma Name",
          institution: "University / Institute Name",
          period: "2022 – 2024",
          details: "Specialization in Quantum Information Science and Applied Mathematics."
        }
      ]
    });
  };

  const removeEducation = (index: number) => {
    setResume({
      ...resume,
      education: resume.education.filter((_, i) => i !== index)
    });
  };

  const updatePublication = (index: number, field: string, val: string) => {
    const updated = [...resume.publications];
    updated[index] = { ...updated[index], [field]: val };
    setResume({ ...resume, publications: updated });
  };

  const addPublication = () => {
    setResume({
      ...resume,
      publications: [
        ...resume.publications,
        {
          id: `pub_${Date.now()}`,
          title: "New Research Paper Title",
          authors: "Upasyo Kushari, et al.",
          venue: "Journal or Conference",
          year: "2026",
          doiUrl: "https://doi.org/..."
        }
      ]
    });
  };

  const removePublication = (index: number) => {
    setResume({
      ...resume,
      publications: resume.publications.filter((_, i) => i !== index)
    });
  };

  const updateAward = (index: number, field: string, val: string) => {
    const updated = [...resume.awards];
    updated[index] = { ...updated[index], [field]: val };
    setResume({ ...resume, awards: updated });
  };

  const addAward = () => {
    setResume({
      ...resume,
      awards: [
        ...resume.awards,
        {
          id: `aw_${Date.now()}`,
          title: "Research Honor / Fellowship",
          issuer: "Organization / University",
          year: "2025",
          description: "Recognized for contributions in quantum computing and neural algorithms."
        }
      ]
    });
  };

  const removeAward = (index: number) => {
    setResume({
      ...resume,
      awards: resume.awards.filter((_, i) => i !== index)
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 md:p-10 print:p-0 print:bg-white print:static print:overflow-visible">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-4xl w-full relative my-auto print:border-none print:shadow-none print:rounded-none print:max-w-none print:my-0 text-zinc-900 dark:text-zinc-100 overflow-hidden"
          id="printable-resume-container"
        >
          {/* Action Toolbar Header (hidden in print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 print:hidden">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-brand-accent-pink">
                <Atom className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
              </span>
              <div>
                <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  CURRICULUM VITAE // {resume.name || "UPASYO KUSHARI"}
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  {isEditing ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> CMS Admin Authenticated · Real-Time CV Edit Mode
                    </span>
                  ) : isAuthenticated ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified CMS Admin Session Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                      <Lock className="w-3 h-3 text-zinc-400" /> Protected Document · CMS Admin Passcode Required to Edit
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* EDIT / VIEW TOGGLE BUTTON (GUARDED BY CMS ADMIN PASSCODE) */}
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-xs ${
                    isAuthenticated 
                      ? "bg-pink-50 dark:bg-pink-950/40 text-brand-accent-pink border border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/60"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-brand-accent-pink hover:text-brand-accent-pink"
                  }`}
                  title={isAuthenticated ? "Edit entire CV / Resume (Admin verified)" : "Unlock CV Editing with CMS Admin Passcode"}
                  id="edit-resume-toggle-btn"
                >
                  {isAuthenticated ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5 text-brand-accent-pink" />
                      <span>EDIT CV / RESUME</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Admin Unlocked" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      <span>EDIT CV (PASSCODE REQUIRED)</span>
                    </>
                  )}
                </button>
              ) : null}

              {isEditing ? (
                <>
                  <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>CMS ADMIN</span>
                  </span>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs"
                    title="Save all changes to database"
                    id="save-resume-btn"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "SAVING..." : "SAVE RESUME"}</span>
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                    title="Switch to formatted preview"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>VIEW FORMATTED</span>
                  </button>

                  <button
                    onClick={handleResetToDefault}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                    title="Reset to default quantum profile baseline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET</span>
                  </button>

                  <button
                    onClick={handleLockSession}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 transition-all cursor-pointer"
                    title="Lock edit mode and disconnect CMS admin session"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>LOCK</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-brand-accent-pink text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-xs"
                    title="Print or Save as PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-brand-accent-pink" />
                    <span>PRINT / SAVE PDF</span>
                  </button>

                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-brand-accent-pink text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-xs"
                    title="Copy Markdown representation"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-brand-accent-pink" />}
                    <span>{copied ? "COPIED" : "COPY MD"}</span>
                  </button>

                  <a
                    href={resume.linkedinUrl || linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#0077b5] text-white hover:opacity-90 transition-all cursor-pointer shadow-xs"
                    title="View LinkedIn Profile"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LINKEDIN</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>

                  {isAuthenticated && (
                    <button
                      onClick={handleLockSession}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Lock CMS Admin Session"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close resume modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Authentication & Status Toasts */}
          {authNotice && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {authNotice}
              </span>
              <button onClick={() => setAuthNotice("")} className="cursor-pointer text-emerald-700 dark:text-emerald-400">✕</button>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Resume successfully saved to Firestore and local cache!
              </span>
              <button onClick={() => setSaveSuccess(false)} className="cursor-pointer text-emerald-700 dark:text-emerald-400">✕</button>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-red-800 dark:text-red-300">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                {saveError}
              </span>
              <button onClick={() => setSaveError("")} className="cursor-pointer text-red-700 dark:text-red-400">✕</button>
            </div>
          )}

          {/* CMS ADMIN PASSCODE VERIFICATION MODAL OVERLAY */}
          {showPasscodeModal && (
            <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/60 flex items-center justify-center text-brand-accent-pink">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        CMS ADMIN PASSCODE REQUIRED
                      </h4>
                      <p className="text-[11px] font-mono text-gray-500 dark:text-zinc-400 mt-0.5">
                        Authorization Gate for CV Editing
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPasscodeModal(false);
                      setPasscodeInput("");
                      setPasscodeError("");
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 rounded-xl text-xs font-mono text-gray-600 dark:text-zinc-400 leading-relaxed">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Security Requirement:</span> Only the person with the proper correct passcode of the CMS admin can edit the Curriculum Vitae.
                </div>

                <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10.5px] font-mono font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                      ENTER CMS ADMIN PASSCODE
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordText ? "text" : "password"}
                        value={passcodeInput}
                        onChange={(e) => {
                          setPasscodeInput(e.target.value);
                          setPasscodeError("");
                        }}
                        placeholder="Enter admin passcode"
                        autoFocus
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 focus:border-brand-accent-pink focus:ring-1 focus:ring-brand-accent-pink rounded-xl px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white pr-10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordText(!showPasswordText)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {passcodeError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-2 text-xs font-mono text-red-600 dark:text-red-400">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{passcodeError}</span>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-brand-accent-pink hover:bg-pink-600 text-white font-mono font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>UNLOCK CV EDITING</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasscodeModal(false);
                        setPasscodeInput("");
                        setPasscodeError("");
                      }}
                      className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* =========================================================
              PRINTABLE RESUME BODY (VIEW MODE & EDIT MODE)
              ========================================================= */}
          <div className="p-6 sm:p-10 space-y-8 print:p-8 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible">
            
            {/* ---------------- EDIT MODE ---------------- */}
            {isEditing ? (
              <div className="space-y-8 font-sans">
                {/* 1. Basic Header Information */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750 space-y-4">
                  <h3 className="font-mono text-xs font-bold text-brand-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                    <Atom className="w-4 h-4" />
                    1. PERSONAL IDENTITY & CONTACT COORDINATES
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">FULL NAME</label>
                      <input
                        type="text"
                        value={resume.name}
                        onChange={(e) => setResume({ ...resume, name: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">PRIMARY PROFESSIONAL TITLE</label>
                      <input
                        type="text"
                        value={resume.title}
                        onChange={(e) => setResume({ ...resume, title: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">RESEARCH FOCUS SUBTITLE</label>
                      <input
                        type="text"
                        value={resume.focus}
                        onChange={(e) => setResume({ ...resume, focus: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        value={resume.email}
                        onChange={(e) => setResume({ ...resume, email: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">LINKEDIN URL</label>
                      <input
                        type="url"
                        value={resume.linkedinUrl}
                        onChange={(e) => setResume({ ...resume, linkedinUrl: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">RESEARCH PORTAL / WEBSITE URL</label>
                      <input
                        type="url"
                        value={resume.websiteUrl}
                        onChange={(e) => setResume({ ...resume, websiteUrl: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">LOCATION / BASE</label>
                      <input
                        type="text"
                        value={resume.location}
                        onChange={(e) => setResume({ ...resume, location: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">STATUS BADGE TEXT</label>
                      <input
                        type="text"
                        value={resume.statusText}
                        onChange={(e) => setResume({ ...resume, statusText: e.target.value })}
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Executive Summary */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750 space-y-3">
                  <h3 className="font-mono text-xs font-bold text-brand-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    2. EXECUTIVE SUMMARY
                  </h3>
                  <textarea
                    rows={4}
                    value={resume.summary}
                    onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white leading-relaxed"
                  />
                </div>

                {/* 3. Core Competencies */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-brand-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-4 h-4" />
                      3. TECHNICAL COMPETENCIES ({resume.competencies.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addCompetency}
                      className="flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-brand-accent-pink text-white hover:bg-pink-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD DOMAIN
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resume.competencies.map((comp, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <input
                          type="text"
                          value={comp.category}
                          onChange={(e) => updateCompetency(idx, "category", e.target.value)}
                          placeholder="Category Header..."
                          className="w-full sm:w-1/3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={comp.skills}
                          onChange={(e) => updateCompetency(idx, "skills", e.target.value)}
                          placeholder="Skills, Frameworks, Tools (comma-separated)..."
                          className="w-full sm:flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeCompetency(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors self-end sm:self-center"
                          title="Remove domain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Research & Work Experience */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-brand-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      4. RESEARCH & WORK EXPERIENCE ({resume.experience.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-brand-accent-pink text-white hover:bg-pink-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD POSITION
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resume.experience.map((exp, expIdx) => (
                      <div key={exp.id || expIdx} className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-950/60 text-brand-accent-pink uppercase">
                            ROLE #{expIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExperience(expIdx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                            title="Remove role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1">JOB / RESEARCH TITLE</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateExperience(expIdx, "role", e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1">COMPANY / INSTITUTION</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(expIdx, "company", e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1">PERIOD (e.g. 2024 – Present)</label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => updateExperience(expIdx, "period", e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1">LOCATION (e.g. Zurich, Switzerland)</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => updateExperience(expIdx, "location", e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Bullets */}
                        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase">Key Contributions / Accomplishments</label>
                            <button
                              type="button"
                              onClick={() => addExperienceBullet(expIdx)}
                              className="text-[10px] font-mono font-bold text-brand-accent-pink hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> ADD BULLET
                            </button>
                          </div>
                          {exp.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="flex gap-2 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-pink flex-shrink-0" />
                              <input
                                type="text"
                                value={b}
                                onChange={(e) => updateExperienceBullet(expIdx, bIdx, e.target.value)}
                                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeExperienceBullet(expIdx, bIdx)}
                                className="text-zinc-400 hover:text-red-500 p-1"
                                title="Delete bullet"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Education */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-brand-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      5. EDUCATION ({resume.education.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-brand-accent-pink text-white hover:bg-pink-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD DEGREE
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resume.education.map((edu, eduIdx) => (
                      <div key={edu.id || eduIdx} className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(eduIdx, "degree", e.target.value)}
                            placeholder="Degree Name (e.g. M.S. in Computer Science)..."
                            className="w-3/4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeEducation(eduIdx)}
                            className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(eduIdx, "institution", e.target.value)}
                            placeholder="Institution / University Name..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200"
                          />
                          <input
                            type="text"
                            value={edu.period}
                            onChange={(e) => updateEducation(eduIdx, "period", e.target.value)}
                            placeholder="Period (e.g. 2020 – 2022)..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                        <input
                          type="text"
                          value={edu.details}
                          onChange={(e) => updateEducation(eduIdx, "details", e.target.value)}
                          placeholder="Specialization, Thesis topic, or Focus area..."
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Publications */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-brand-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      6. SELECTED PUBLICATIONS ({resume.publications.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addPublication}
                      className="flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-brand-accent-pink text-white hover:bg-pink-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD PAPER
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resume.publications.map((pub, pubIdx) => (
                      <div key={pub.id || pubIdx} className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            value={pub.title}
                            onChange={(e) => updatePublication(pubIdx, "title", e.target.value)}
                            placeholder="Paper Title..."
                            className="w-3/4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removePublication(pubIdx)}
                            className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={pub.authors}
                            onChange={(e) => updatePublication(pubIdx, "authors", e.target.value)}
                            placeholder="Authors..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200"
                          />
                          <input
                            type="text"
                            value={pub.venue}
                            onChange={(e) => updatePublication(pubIdx, "venue", e.target.value)}
                            placeholder="Journal or Conference..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200"
                          />
                          <input
                            type="text"
                            value={pub.year}
                            onChange={(e) => updatePublication(pubIdx, "year", e.target.value)}
                            placeholder="Year..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                        <input
                          type="url"
                          value={pub.doiUrl || ""}
                          onChange={(e) => updatePublication(pubIdx, "doiUrl", e.target.value)}
                          placeholder="DOI Link URL (e.g. https://doi.org/...)"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-700 dark:text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Honors & Awards */}
                <div className="p-5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-750 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs font-bold text-brand-accent-pink uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      7. HONORS & AWARDS ({resume.awards.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addAward}
                      className="flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded bg-brand-accent-pink text-white hover:bg-pink-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD AWARD
                    </button>
                  </div>

                  <div className="space-y-3">
                    {resume.awards.map((aw, awIdx) => (
                      <div key={aw.id || awIdx} className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            value={aw.title}
                            onChange={(e) => updateAward(awIdx, "title", e.target.value)}
                            placeholder="Award or Fellowship Title..."
                            className="w-3/4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs font-bold text-zinc-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeAward(awIdx)}
                            className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={aw.issuer}
                            onChange={(e) => updateAward(awIdx, "issuer", e.target.value)}
                            placeholder="Issuing Entity..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200"
                          />
                          <input
                            type="text"
                            value={aw.year}
                            onChange={(e) => updateAward(awIdx, "year", e.target.value)}
                            placeholder="Year..."
                            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                        <input
                          type="text"
                          value={aw.description}
                          onChange={(e) => updateAward(awIdx, "description", e.target.value)}
                          placeholder="Short description of accomplishment..."
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Save Action Bar */}
                <div className="pt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg font-mono text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-mono text-xs font-bold bg-brand-accent-pink hover:bg-pink-600 text-white shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "PERSISTING DATA..." : "SAVE & UPDATE RESUME"}
                  </button>
                </div>
              </div>
            ) : (
              /* ---------------- VIEW MODE ---------------- */
              <>
                {/* Header / Contact Info */}
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 print:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white font-display uppercase">
                      {resume.name}
                    </h1>
                    <p className="text-base sm:text-lg font-mono font-semibold text-brand-accent-pink mt-1 flex items-center gap-2">
                      <Atom className="w-4 h-4" />
                      {resume.title}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                      {resume.focus}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-accent-pink" />
                      <a href={`mailto:${resume.email || userEmail}`} className="hover:underline text-zinc-800 dark:text-zinc-200 font-medium">
                        {resume.email || userEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                      <a href={resume.linkedinUrl || linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-zinc-800 dark:text-zinc-200 font-medium break-all">
                        {resume.linkedinUrl || linkedinUrl}
                      </a>
                    </div>
                    {resume.websiteUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                        <a href={resume.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-zinc-800 dark:text-zinc-200 font-medium">
                          {resume.websiteUrl}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-zinc-600 dark:text-zinc-300">{resume.location}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{resume.statusText}</span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <section className="space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                    <FileText className="w-4 h-4 text-brand-accent-pink" />
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-white uppercase">
                      EXECUTIVE SUMMARY
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200 font-sans">
                    {resume.summary}
                  </p>
                </section>

                {/* Core Competencies & Technical Skills */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                    <Code className="w-4 h-4 text-brand-accent-pink" />
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-white uppercase">
                      CORE TECHNICAL COMPETENCIES
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {resume.competencies.map((comp, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-850/60 border border-zinc-200/70 dark:border-zinc-800">
                        <span className="text-[10px] font-mono font-bold text-brand-accent-pink tracking-wider uppercase block mb-1">
                          {comp.category}
                        </span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 font-sans leading-normal">
                          {comp.skills}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Research & Professional Experience */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                    <Briefcase className="w-4 h-4 text-brand-accent-pink" />
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-white uppercase">
                      RESEARCH & PROFESSIONAL EXPERIENCE
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {resume.experience.map((item, idx) => (
                      <div key={item.id || idx} className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white font-sans">
                              {item.role}
                            </h3>
                            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                              {item.company} · <span className="text-zinc-400">{item.location}</span>
                            </p>
                          </div>
                          <span className="text-xs font-mono font-semibold text-brand-accent-pink sm:text-right">
                            {item.period}
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-sans pl-1">
                          {item.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-brand-accent-pink rounded-full mt-1.5 flex-shrink-0" />
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Selected Research Publications */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                    <BookOpen className="w-4 h-4 text-brand-accent-pink" />
                    <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-white uppercase">
                      SELECTED RESEARCH PUBLICATIONS
                    </h2>
                  </div>

                  <ol className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300 font-sans list-decimal list-inside">
                    {resume.publications.map((pub, idx) => (
                      <li key={pub.id || idx} className="leading-relaxed pl-1">
                        <span className="font-semibold text-zinc-900 dark:text-white">{pub.authors}</span>{" "}
                        "{pub.title}." <em className="text-zinc-800 dark:text-zinc-200">{pub.venue}</em>, {pub.year}.
                        {pub.doiUrl && (
                          <a
                            href={pub.doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-accent-pink hover:underline ml-2 font-mono"
                          >
                            <span>[DOI]</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Education & Academic Background */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <section className="space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                      <GraduationCap className="w-4 h-4 text-brand-accent-pink" />
                      <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-white uppercase">
                        EDUCATION
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {resume.education.map((edu, idx) => (
                        <div key={edu.id || idx}>
                          <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white font-sans">
                            {edu.degree}
                          </h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans">
                            {edu.institution} · <span className="font-mono text-zinc-400">{edu.period}</span>
                          </p>
                          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {edu.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Honors & Accolades */}
                  <section className="space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                      <Award className="w-4 h-4 text-brand-accent-pink" />
                      <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-white uppercase">
                        HONORS & FELLOWSHIPS
                      </h2>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 font-sans">
                      {resume.awards.map((aw, idx) => (
                        <li key={aw.id || idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 bg-brand-accent-pink rounded-full mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {aw.title} <span className="font-normal text-zinc-500 dark:text-zinc-400">({aw.issuer}, {aw.year})</span>
                            </p>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                              {aw.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Footer Notice */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-[10px] font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span>{resume.name} · Quantum Computing Research CV</span>
                  <span>Verified LinkedIn: <a href={resume.linkedinUrl || linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-brand-accent-pink underline">{resume.linkedinUrl || linkedinUrl}</a></span>
                </div>
              </>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
