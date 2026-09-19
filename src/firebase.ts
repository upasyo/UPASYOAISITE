import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc,
  getDocFromServer,
  getDocsFromServer,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
// @ts-ignore
import swissAlpsImage from "./assets/images/swiss_alps_white_1782287887159.jpg";

// Firebase Applet Configurations - read directly or fallback safely
const firebaseConfig = {
  apiKey: "AIzaSyDEnXq8c7W7ga3dJWF4EVUVJZ25aa8xreo",
  authDomain: "molten-tine-1dpgw.firebaseapp.com",
  projectId: "molten-tine-1dpgw",
  storageBucket: "molten-tine-1dpgw.firebasestorage.app",
  messagingSenderId: "757561179668",
  appId: "1:757561179668:web:93b60e2d0fb24252c6f101"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-5e90e300-b611-4604-9082-bc44d88c2d44");
export const auth = getAuth(app);

// Collection Names
export const COLLECTIONS = {
  SITE_SETTINGS: "siteSettings",
  HERO: "heroSection",
  ABOUT: "aboutSection",
  RESEARCH_AREAS: "researchAreas",
  RESEARCH_VISION: "researchVision",
  PROJECTS: "projects",
  PUBLICATIONS: "publications",
  ACHIEVEMENTS: "achievements",
  BLOG_POSTS: "blogPosts",
  CONTACT_MESSAGES: "contactMessages",
  KNOWLEDGE_BASE: "knowledgeBase",
  BUTTON_LINKS: "buttonLinks",
  ANIMATIONS: "animations",
  RESUME: "resume"
};

// Seeding Data
export const SEED_DATA = {
  siteSettings: {
    id: "default",
    brandName: "UPASYO KUSHARI",
    logoStyle: "animated-quantum-glow",
    footerText: "© 2026 Upasyo Kushari. Quantum Computing & Advanced AI Research Lab. All rights reserved.",
    themePalette: "Pastel Pink Accent Theme",
    primaryColor: "#ffffff",
    accentColor: "#fbcfe8",
    backgroundVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-covered-in-snow-with-falling-flakes-38556-large.mp4",
    enableBackgroundVideo: true,
    linkedinUrl: "https://www.linkedin.com/in/upasyokushari/",
    githubUrl: "https://github.com",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    whatsappUrl: "https://wa.me",
    spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing",
    spreadsheetWebhookUrl: "",
    tickerText: "QUANTUM COMPUTING RESEARCH, FAULT-TOLERANT QUANTUM ARCHITECTURES, QUANTUM MACHINE LEARNING (QML), VARIATIONAL QUANTUM EIGENSOLVERS (VQE), QUANTUM ERROR CORRECTION (QEC), TENSOR NETWORK SIMULATIONS, QUANTUM SUPREMACY & ADVANTAGE, NEURO-QUANTUM COGNITION",
    buttons: {
      collab: { name: "DEPLOY QUANTUM COLLAB", url: "#contact", color: "" },
      resume: { name: "VIEW_RESUME", url: "#resume", color: "" },
      inquiry: { name: "TRANSMIT_INQUIRY", url: "", color: "" },
      readResearch: { name: "READ_RESEARCH_POST", url: "", color: "" },
      citeAbs: { name: "CITE_ABS", url: "", color: "" },
      resetPortal: { name: "RESET_TELEMETRY_PORTAL", url: "", color: "" },
      dismissArticle: { name: "DISMISS_ARTICLE", url: "", color: "" }
    }
  },
  heroSection: {
    id: "default",
    title: "Quantum Computing & Advanced Neural Intelligence",
    subtitle: "Quantum Computing Researcher & AI Scientist",
    description: "Pioneering the synthesis of Quantum Computing, Quantum Machine Learning (QML), and Fault-Tolerant Architectures. Engineering hybrid quantum-classical algorithms, tensor network representations, and variational quantum eigensolvers to transcend classical computing limits.",
    resumeUrl: "https://www.linkedin.com/in/upasyokushari/",
    profileImage: swissAlpsImage
  },
  aboutSection: {
    id: "default",
    bio: "Upasyo Kushari is a Quantum Computing Researcher and AI Scientist dedicated to advancing quantum-classical hybrid algorithms, quantum machine learning (QML), variational quantum eigensolvers (VQE), and fault-tolerant quantum error correction (QEC). Combining rigorous quantum information theory with high-performance computing, Upasyo develops scalable quantum circuit optimizations, tensor network emulators, and barren-plateau mitigation schemes that empower next-generation quantum advantage.",
    skills: [
      "Quantum Machine Learning (QML)",
      "Variational Quantum Eigensolvers (VQE & QAOA)",
      "Quantum Circuit Design (Qiskit, PennyLane, Cirq)",
      "Fault-Tolerant Surface Codes & QEC",
      "Tensor Networks (MPS, PEPS)",
      "Quantum-Classical Hybrid Co-Design",
      "Quantum Information & Entanglement Theory",
      "High-Performance Computing (PyTorch, JAX, CUDA)"
    ]
  },
  researchVision: {
    id: "default",
    title: "Towards Fault-Tolerant Quantum Advantage & Quantum-Classical Co-Design",
    paragraph1: "Quantum computing is at a pivotal inflection point: transitioning from noisy intermediate-scale quantum (NISQ) demonstrations to fault-tolerant architectures. My research investigates how parameterized quantum circuits and quantum embedding spaces can transcend classical computational barriers in complex physical simulations, non-convex optimization, and high-dimensional generative intelligence.",
    paragraph2: "By synthesizing tensor network contractions with variational quantum eigensolvers (VQE) and quantum error-mitigated neural architectures, we construct verifiable mathematical bridges connecting quantum hardware to real-world quantum advantage."
  },
  researchAreas: [
    {
      id: "area1",
      title: "Quantum Machine Learning (QML) & Neural Circuits",
      description: "Developing parameterized quantum circuits (PQCs), quantum kernels, and barren-plateau mitigation strategies for high-dimensional feature embeddings and generative neural dynamics.",
      icon: "Cpu",
      order: 1
    },
    {
      id: "area2",
      title: "Fault-Tolerant Quantum Error Correction (QEC)",
      description: "Constructing scalable rotated surface code decoders, stabilizer formalisms, and fault-tolerance threshold bounds under non-Markovian noise environments.",
      icon: "ShieldAlert",
      order: 2
    },
    {
      id: "area3",
      title: "Variational Quantum Algorithms (VQE & QAOA)",
      description: "Designing hybrid quantum-classical solvers for molecular Hamiltonian energy estimation, quantum chemistry, and NP-hard combinatorial optimization problems.",
      icon: "BrainCircuit",
      order: 3
    },
    {
      id: "area4",
      title: "Tensor Networks & Quantum Many-Body Simulation",
      description: "Leveraging Matrix Product States (MPS) and PEPS tensor contractions to classically emulate multi-qubit entanglement and analyze quantum state tomography up to 50+ qubits.",
      icon: "Layers",
      order: 4
    }
  ],
  projects: [
    {
      id: "proj1",
      title: "QuTensorNet",
      subtitle: "Accelerated Quantum Circuit Simulator & Tensor Contraction Engine",
      description: "A high-performance quantum simulation framework utilizing Matrix Product States (MPS) and custom CUDA kernels to simulate deep quantum circuits with 50+ qubits with minimal entanglement truncation error.",
      tags: ["Python", "C++", "CUDA", "PennyLane", "Qiskit", "PyTorch"],
      github: "https://github.com",
      demo: "https://demo.com",
      impact: "Achieved 3.8x acceleration in tensor network contraction times over standard baseline solvers.",
      order: 1
    },
    {
      id: "proj2",
      title: "QuHybrid-VQE",
      subtitle: "Adaptive Variational Quantum-Classical Molecular Eigensolver",
      description: "An adaptive ansatz generation pipeline designed for molecular ground state estimation, incorporating geometric entanglement initialization to eliminate barren plateaus in deep variational circuits.",
      tags: ["Qiskit", "Pennylane", "OpenFermion", "VQE", "JAX"],
      github: "https://github.com",
      demo: "https://demo.com",
      impact: "Calculated molecular dissociation curves with chemical accuracy (< 1 kcal/mol) on simulated NISQ hardware.",
      order: 2
    },
    {
      id: "proj3",
      title: "SurfaceCode-Decoder",
      subtitle: "High-Throughput Quantum Error Correction & Syndrome Decoder",
      description: "A real-time rotated surface code decoder implementing minimum-weight perfect matching (MWPM) and union-find algorithms to identify and correct bit-flip and phase-flip errors in quantum memory.",
      tags: ["C++", "Python", "Stim", "PyMatching", "QEC"],
      github: "https://github.com",
      demo: "https://demo.com",
      impact: "Demonstrated sustainable pseudo-threshold of 1.1% under correlated phenomenological noise channels.",
      order: 3
    }
  ],
  publications: [
    {
      id: "pub1",
      title: "Adaptive Parameterized Quantum Circuits for Accelerated Variational Quantum Eigensolvers",
      authors: "Upasyo Kushari, et al.",
      venue: "IEEE Transactions on Quantum Engineering (TQE) 2026",
      url: "https://www.linkedin.com/in/upasyokushari/",
      date: "2026-05-12",
      order: 1
    },
    {
      id: "pub2",
      title: "Syndrome Decoding and Fault-Tolerance Thresholds in Rotated Surface Codes under Non-Markovian Noise",
      authors: "Upasyo Kushari, et al.",
      venue: "Physical Review A / Quantum Information 2025",
      url: "https://www.linkedin.com/in/upasyokushari/",
      date: "2025-11-20",
      order: 2
    },
    {
      id: "pub3",
      title: "Quantum Kernel Methods for High-Dimensional Topological Data Analysis",
      authors: "Upasyo Kushari, et al.",
      venue: "IEEE International Conference on Quantum Computing and Engineering (QCE) 2025",
      url: "https://www.linkedin.com/in/upasyokushari/",
      date: "2025-09-18",
      order: 3
    },
    {
      id: "pub4",
      title: "Mitigating Barren Plateaus in Deep Quantum Neural Networks via Geometric Entanglement Initialization",
      authors: "Upasyo Kushari, et al.",
      venue: "Quantum Science and Technology 2025",
      url: "https://www.linkedin.com/in/upasyokushari/",
      date: "2025-03-14",
      order: 4
    }
  ],
  achievements: [
    {
      id: "ach1",
      title: "Quantum Computing Research Fellowship (2025-2026)",
      issuer: "Global Institute for Quantum Technologies",
      description: "Awarded for pioneering research in variational quantum algorithms, barren-plateau mitigation, and quantum error correction.",
      order: 1
    },
    {
      id: "ach2",
      title: "Best Research Contribution in Quantum Algorithms",
      issuer: "IEEE Quantum Computing Forum",
      description: "Honored for groundbreaking work on adaptive parameterized quantum circuits and molecular Hamiltonian simulation.",
      order: 2
    },
    {
      id: "ach3",
      title: "IBM Certified Quantum Developer & Qiskit Advocate",
      issuer: "IBM Quantum Network",
      description: "Recognized for contributions to the open-source quantum software ecosystem, circuit optimization, and quantum educational outreach.",
      order: 3
    }
  ],
  blogPosts: [
    {
      id: "blog1",
      title: "Demystifying Quantum Machine Learning: From Qubits to Parameterized Quantum Circuits",
      category: "Quantum Machine Learning",
      date: "2026-06-12",
      readingTime: "6 min",
      summary: "Exploring how quantum embedding spaces map classical data into exponentially vast Hilbert spaces, and how parameterized ansatzes unlock non-linear expressivity.",
      content: "## The Quantum Representation Paradigm\n\nClassical machine learning represents information as vectors in Euclidean spaces. But what happens when we encode features into the quantum state of entangled qubits? In an n-qubit register, the state space spans $2^n$ dimensions.\n\n### Parameterized Quantum Circuits (PQCs)\n\nBy tuning rotational angles across unitary gates $U(\\theta)$, we construct quantum neural networks. However, trainability is hindered by barren plateaus—exponential vanishing gradients across deep randomized circuits. Upasyo Kushari's recent work introduces geometric entanglement initialization and layer-wise pre-training to retain steep gradient landscapes and enable genuine quantum learning advantage.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600",
      order: 1
    },
    {
      id: "blog2",
      title: "The Anatomy of Quantum Error Correction: Why Surface Codes are the Key to Fault Tolerance",
      category: "Quantum Error Correction",
      date: "2026-04-05",
      readingTime: "8 min",
      summary: "An in-depth analysis of topological surface codes, syndrome extraction routines, and why real-time decoding is the paramount hurdle to universal fault tolerance.",
      content: "## From NISQ to Fault Tolerance\n\nNoisy Intermediate-Scale Quantum (NISQ) devices suffer from environmental decoherence and gate infidelities. Without error correction, quantum algorithms are strictly bounded in circuit depth.\n\n### The Rotated Surface Code\n\nSurface codes store a single logical qubit across a two-dimensional grid of physical data and syndrome qubits. By measuring star and plaquette stabilizer operators $X$-type and $Z$-type non-destructively, we diagnose error chains. Upasyo's research focuses on accelerated decoding via minimum-weight matching and tensor networks, drastically reducing syndrome latency on real-time control hardware.",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600",
      order: 2
    },
    {
      id: "blog3",
      title: "Tensor Networks: How Quantum Physics is Revolutionizing Classical Machine Learning",
      category: "Quantum Simulation",
      date: "2026-02-18",
      readingTime: "7 min",
      summary: "How Matrix Product States (MPS) and tensor contractions allow computational scientists to simulate quantum entanglement and compress gigantic neural architectures.",
      content: "## The Exponential Curse and Tensor Decompositions\n\nAn arbitrary quantum state requires $2^n$ complex amplitudes. Yet physical states of matter satisfy 'area laws' of entanglement, concentrating information in low-rank manifolds.\n\n### Matrix Product States (MPS)\n\nBy decomposing tensors using Singular Value Decompositions (SVD), we compress the exponential representation into polynomial bond dimensions. In Upasyo's project QuTensorNet, tensor networks are deployed both to simulate 50+ qubit quantum circuits classically and to compress dense classical deep networks with zero accuracy degradation.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
      order: 3
    }
  ],
  knowledgeBase: [
    {
      id: "k1",
      content: "Upasyo Kushari is a Quantum Computing Researcher and AI Scientist specializing in Quantum Machine Learning (QML), Variational Quantum Algorithms (VQE, QAOA), Fault-Tolerant Quantum Error Correction (QEC), and Tensor Networks.",
      category: "General Biography"
    },
    {
      id: "k2",
      content: "Upasyo Kushari's verified LinkedIn profile is https://www.linkedin.com/in/upasyokushari/ and his research contact email is upasyokushari@gmail.com.",
      category: "Contact & Profile"
    },
    {
      id: "k3",
      content: "Upasyo Kushari has authored key quantum computing publications including 'Adaptive Parameterized Quantum Circuits for Accelerated Variational Quantum Eigensolvers' (IEEE TQE 2026) and 'Syndrome Decoding and Fault-Tolerance Thresholds in Rotated Surface Codes' (Physical Review A 2025).",
      category: "Publications"
    },
    {
      id: "k4",
      content: "Upasyo developed QuTensorNet, a high-performance quantum circuit simulator with accelerated tensor network contractions supporting 50+ qubits classically using Python, C++, CUDA, and PennyLane.",
      category: "Projects"
    },
    {
      id: "k5",
      content: "Upasyo created QuHybrid-VQE, an adaptive variational quantum-classical molecular eigensolver capable of chemical accuracy simulations on molecular dissociation curves.",
      category: "Projects"
    },
    {
      id: "k6",
      content: "Upasyo developed SurfaceCode-Decoder, an optimized C++ and Stim implementation for rotated surface code syndrome decoding with a 1.1% pseudo-threshold under noise.",
      category: "Projects"
    },
    {
      id: "k7",
      content: "Upasyo received the Quantum Computing Research Fellowship (2025-2026) from the Global Institute for Quantum Technologies and is an IBM Certified Quantum Developer.",
      category: "Achievements & Honors"
    },
    {
      id: "k8",
      content: "Upasyo specializes in Qiskit, PennyLane, Cirq, PyQuil, QuTiP, TensorCircuit, PyTorch, JAX, CUDA, and C++ for quantum-classical algorithm engineering.",
      category: "Technical Skills"
    }
  ],
  animations: [
    {
      id: "anim-hero",
      type: "aos",
      name: "Hero Section Fade",
      selector: "hero-section",
      effect: "fade-up",
      duration: 1000,
      delay: 0,
      enabled: true
    },
    {
      id: "anim-about",
      type: "aos",
      name: "About Bio Fade Left",
      selector: "about-section",
      effect: "fade-left",
      duration: 1000,
      delay: 100,
      enabled: true
    },
    {
      id: "anim-research",
      type: "aos",
      name: "Research Area Cards Zoom",
      selector: "research-areas",
      effect: "zoom-in",
      duration: 800,
      delay: 200,
      enabled: true
    },
    {
      id: "anim-projects",
      type: "aos",
      name: "Projects Container Slide",
      selector: "projects",
      effect: "fade-right",
      duration: 900,
      delay: 150,
      enabled: true
    }
  ]
};

// Seeding engine to make the website immediately populated and beautiful
export async function seedDatabaseIfEmpty() {
  try {
    const settingsDocRef = doc(db, COLLECTIONS.SITE_SETTINGS, "default");
    const docSnap = await getDocFromServer(settingsDocRef);
    
    if (docSnap.exists()) {
      console.log("Firebase Database is already seeded.");
      return;
    }
    
    console.log("Empty database detected! Initiating elite quantum computing seeding sequence...");
    await syncQuantumSeedToDatabase();
  } catch (error) {
    console.error("Database Seeding Failed:", error);
  }
}

// Force sync quantum computing research profile to Firestore
export async function syncQuantumSeedToDatabase() {
  try {
    console.log("Syncing Quantum Computing Research Seed to database...");

    // 1. Site Settings
    await setDoc(doc(db, COLLECTIONS.SITE_SETTINGS, "default"), SEED_DATA.siteSettings);
    
    // 2. Hero Section
    await setDoc(doc(db, COLLECTIONS.HERO, "default"), SEED_DATA.heroSection);
    
    // 3. About Section
    await setDoc(doc(db, COLLECTIONS.ABOUT, "default"), SEED_DATA.aboutSection);
    
    // 4. Research Vision
    await setDoc(doc(db, COLLECTIONS.RESEARCH_VISION, "default"), SEED_DATA.researchVision);
    
    // 5. Research Areas
    for (const area of SEED_DATA.researchAreas) {
      await setDoc(doc(db, COLLECTIONS.RESEARCH_AREAS, area.id), area);
    }
    
    // 6. Projects
    for (const proj of SEED_DATA.projects) {
      await setDoc(doc(db, COLLECTIONS.PROJECTS, proj.id), proj);
    }
    
    // 7. Publications
    for (const pub of SEED_DATA.publications) {
      await setDoc(doc(db, COLLECTIONS.PUBLICATIONS, pub.id), pub);
    }
    
    // 8. Achievements
    for (const ach of SEED_DATA.achievements) {
      await setDoc(doc(db, COLLECTIONS.ACHIEVEMENTS, ach.id), ach);
    }
    
    // 9. Blog Posts
    for (const post of SEED_DATA.blogPosts) {
      await setDoc(doc(db, COLLECTIONS.BLOG_POSTS, post.id), post);
    }
    
    // 10. Knowledge Base
    for (const k of SEED_DATA.knowledgeBase) {
      await setDoc(doc(db, COLLECTIONS.KNOWLEDGE_BASE, k.id), k);
    }

    // 11. Animations
    for (const anim of SEED_DATA.animations) {
      await setDoc(doc(db, COLLECTIONS.ANIMATIONS, anim.id), anim);
    }
    
    console.log("Firebase database successfully synchronized with Quantum Computing Research Profile!");
    return true;
  } catch (error) {
    console.error("Failed to sync quantum seed to database:", error);
    throw error;
  }
}

// Read Helpers
export async function fetchDoc(collectionName: string, docId: string = "default", bypassCache: boolean = true) {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = bypassCache ? await getDocFromServer(docRef) : await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error(`Error fetching document ${docId} from ${collectionName}:`, err);
    return null;
  }
}

export async function fetchCollection(collectionName: string, sortByOrder: boolean = true, bypassCache: boolean = true) {
  try {
    const colRef = collection(db, collectionName);
    const q = sortByOrder ? query(colRef, orderBy("order", "asc")) : colRef;
    const snap = bypassCache ? await getDocsFromServer(q) : await getDocs(q);
    const items: any[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (err) {
    // If the query fails due to missing order field or query indexing, fall back to plain fetch and simple client side ordering
    try {
      const colRef = collection(db, collectionName);
      const snap = bypassCache ? await getDocsFromServer(colRef) : await getDocs(colRef);
      const items: any[] = [];
      snap.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      if (sortByOrder) {
        items.sort((a, b) => (a.order || 99) - (b.order || 100));
      }
      return items;
    } catch (nestedErr) {
      console.error(`Error fetching collection ${collectionName}:`, nestedErr);
      return [];
    }
  }
}

// Write/Upsert Helpers
export async function updateOrCreateDoc(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (err) {
    console.error(`Error updating document ${docId} inside ${collectionName}:`, err);
    throw err;
  }
}

export async function deleteDocument(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, err);
    throw err;
  }
}

// Submit contact form message in Firestore and insert the date of the form for the spreadsheet
export async function submitContactMessage(
  name: string, 
  email: string, 
  subject: string, 
  message: string, 
  formDate?: string,
  spreadsheetWebhookUrl?: string
) {
  try {
    const submissionDate = formDate || new Date().toISOString().split("T")[0];
    const now = new Date();
    const formattedTimestamp = now.toISOString();
    const formattedDate = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const messageData = {
      name,
      email,
      subject,
      message,
      date: submissionDate,
      formattedDate,
      formattedTime,
      timestamp: formattedTimestamp
    };

    const colRef = collection(db, COLLECTIONS.CONTACT_MESSAGES);
    const docRef = await addDoc(colRef, messageData);

    // Relay to Express backend endpoint for logging and optional spreadsheet webhook forwarding
    try {
      await fetch("/api/record-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...messageData,
          docId: docRef.id,
          spreadsheetWebhookUrl
        })
      });
    } catch (relayErr) {
      console.warn("Spreadsheet relay notice:", relayErr);
    }

    return { id: docRef.id, ...messageData };
  } catch (err) {
    console.error("Error submitting contact message to firestore:", err);
    throw err;
  }
}

// ==========================================
// RESUME / CV DATA MODEL & PERSISTENCE
// ==========================================
export interface ResumeCompetency {
  category: string;
  skills: string;
}

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  institution: string;
  period: string;
  details: string;
}

export interface ResumePublication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  doiUrl?: string;
}

export interface ResumeAward {
  id: string;
  title: string;
  issuer: string;
  year: string;
  description: string;
}

export interface ResumeData {
  id?: string;
  name: string;
  title: string;
  focus: string;
  email: string;
  linkedinUrl: string;
  websiteUrl: string;
  location: string;
  statusText: string;
  summary: string;
  competencies: ResumeCompetency[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  publications: ResumePublication[];
  awards: ResumeAward[];
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  id: "default",
  name: "UPASYO KUSHARI",
  title: "Quantum Computing Researcher & AI Scientist",
  focus: "Quantum Information Science · Quantum Machine Learning · Fault-Tolerant Architectures",
  email: "upasyokushari@gmail.com",
  linkedinUrl: "https://www.linkedin.com/in/upasyokushari/",
  websiteUrl: "https://upasyo.research",
  location: "Zurich / Remote",
  statusText: "Available for Quantum Research Collaboration",
  summary: "Quantum Computing Researcher and AI Scientist with extensive experience bridging Quantum Information Theory, Variational Quantum Algorithms (VQE, QAOA), Quantum Machine Learning (QML), and Fault-Tolerant Quantum Error Correction (QEC). Dedicated to unlocking computational advantage in non-convex optimization, high-dimensional data classification, and molecular Hamiltonian simulation through hybrid quantum-classical algorithms, tensor network contractions, and novel barren-plateau mitigation schemes.",
  competencies: [
    {
      category: "QUANTUM SDKs & COMPUTATION",
      skills: "Qiskit, PennyLane, Cirq, Q#, PyQuil, QuTiP, TensorCircuit, Amazon Braket, IBM Quantum Experience"
    },
    {
      category: "QUANTUM ALGORITHMS & THEORY",
      skills: "Variational Quantum Eigensolver (VQE), QAOA, Quantum Phase Estimation (QPE), Surface Code Stabilization, Topological Quantum Memory, Quantum Kernel Methods"
    },
    {
      category: "AI & CLASSICAL MACHINE LEARNING",
      skills: "PyTorch, JAX, TensorFlow, Transformers, Graph Neural Networks, RLAIF, High-Performance Cluster Computing, Distributed CUDA"
    },
    {
      category: "LANGUAGES, HARDWARE & HPC",
      skills: "Python, C++, Julia, Rust, CUDA C, Linux HPC Clusters, SLURM, Git CI/CD"
    }
  ],
  experience: [
    {
      id: "exp1",
      role: "Lead Quantum Computing Researcher & AI Scientist",
      company: "Quantum Information & Neural Architectures Laboratory",
      period: "2024 – Present",
      location: "Zurich, Switzerland",
      bullets: [
        "Formulated adaptive parameterized quantum circuits (PQCs) mitigating barren plateau phenomena in deep quantum neural networks.",
        "Developed high-performance tensor network contraction pipelines (MPS/PEPS) allowing classical simulation of quantum systems up to 50+ qubits.",
        "Designed hybrid quantum-classical molecular Hamiltonian solvers with Qiskit and Pennylane for chemical simulation."
      ]
    },
    {
      id: "exp2",
      role: "Quantum Machine Learning Researcher & Algorithm Engineer",
      company: "Advanced Quantum Systems Group",
      period: "2022 – 2024",
      location: "Remote / Hybrid",
      bullets: [
        "Engineered quantum kernel estimation algorithms yielding high-dimensional topological data separation on complex datasets.",
        "Implemented high-throughput rotated surface code syndrome decoding algorithms in C++ for real-time quantum error correction.",
        "Executed hardware execution benchmarks across superconducting transmon qubits and trapped-ion quantum processors."
      ]
    },
    {
      id: "exp3",
      role: "Graduate Quantum Research Fellow",
      company: "Computational Physics & Quantum Technologies Institute",
      period: "2020 – 2022",
      location: "Academic Research Hub",
      bullets: [
        "Researched quantum decoherence and non-Markovian noise mitigation in superconducting quantum circuits.",
        "Co-authored mathematical proofs on stabilizer formalisms and fault-tolerance error thresholds."
      ]
    }
  ],
  education: [
    {
      id: "edu1",
      degree: "Master of Science (M.S.) in Computer Science & Quantum Information Science",
      institution: "Institute for Quantum Computing / University",
      period: "2020 – 2022",
      details: "Specialization in Quantum Algorithms, Quantum Information Theory, and Mathematical Physics. Master's Thesis on Variational Quantum Eigensolvers."
    },
    {
      id: "edu2",
      degree: "Bachelor of Science (B.S.) in Computer Science & Applied Mathematics",
      institution: "Department of Computer Science & Mathematics",
      period: "2016 – 2020",
      details: "Focus on Linear Algebra, Computational Complexity, Quantum Mechanics, and High-Performance Parallel Computing."
    }
  ],
  publications: [
    {
      id: "pub1",
      title: "Adaptive Parameterized Quantum Circuits for Accelerated Variational Quantum Eigensolvers",
      authors: "Upasyo Kushari, et al.",
      venue: "IEEE Transactions on Quantum Engineering",
      year: "2026",
      doiUrl: "https://doi.org/10.1109/TQE.2026"
    },
    {
      id: "pub2",
      title: "Syndrome Decoding and Fault-Tolerance Thresholds in Rotated Surface Codes under Non-Markovian Noise",
      authors: "Upasyo Kushari, et al.",
      venue: "Physical Review A / Quantum Information",
      year: "2025",
      doiUrl: "https://doi.org/10.1103/PhysRevA.2025"
    },
    {
      id: "pub3",
      title: "Quantum Kernel Methods for High-Dimensional Topological Data Analysis",
      authors: "Upasyo Kushari, et al.",
      venue: "IEEE International Conference on Quantum Computing and Engineering (QCE)",
      year: "2025",
      doiUrl: "https://doi.org/10.1109/QCE.2025"
    },
    {
      id: "pub4",
      title: "Mitigating Barren Plateaus in Deep Quantum Neural Networks via Geometric Entanglement Initialization",
      authors: "Upasyo Kushari, et al.",
      venue: "Quantum Science and Technology",
      year: "2025",
      doiUrl: "https://doi.org/10.1088/2058-9565"
    }
  ],
  awards: [
    {
      id: "ach1",
      title: "Quantum Computing Research Fellowship",
      issuer: "Global Institute for Quantum Technologies",
      year: "2025",
      description: "Awarded for pioneering research in variational quantum algorithms and quantum error mitigation schemes."
    },
    {
      id: "ach2",
      title: "Best Research Contribution Award",
      issuer: "IEEE Quantum Computing Forum",
      year: "2024",
      description: "Recognized for breakthrough contributions to adaptive parameterized quantum circuits and molecular Hamiltonian estimation."
    },
    {
      id: "ach3",
      title: "IBM Quantum Developer Certification & Qiskit Advocate",
      issuer: "IBM Quantum Network",
      year: "2023",
      description: "Honored for technical mastery of quantum circuit optimization and open-source contributions to quantum SDKs."
    }
  ]
};

// Fetch Resume Data from Firestore with localStorage & seed fallback
export async function fetchResumeData(): Promise<ResumeData> {
  try {
    const docData = await fetchDoc(COLLECTIONS.RESUME, "default");
    if (docData && docData.name) {
      localStorage.setItem("upasyo_resume_data", JSON.stringify(docData));
      return { ...DEFAULT_RESUME_DATA, ...docData } as ResumeData;
    }
  } catch (err) {
    console.warn("Could not fetch resume from Firestore, falling back to local storage:", err);
  }

  const cached = localStorage.getItem("upasyo_resume_data");
  if (cached) {
    try {
      return { ...DEFAULT_RESUME_DATA, ...JSON.parse(cached) };
    } catch {
      // ignore JSON parse error
    }
  }

  return DEFAULT_RESUME_DATA;
}

export const CMS_ADMIN_PASSCODE = "Upasyo@2007";

// Check if CMS admin is authenticated
export function isCmsAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("upasyo_cms_admin_auth") === "true";
}

// Set CMS admin authentication status in session
export function setCmsAdminAuthenticated(authenticated: boolean): void {
  if (typeof window === "undefined") return;
  if (authenticated) {
    sessionStorage.setItem("upasyo_cms_admin_auth", "true");
  } else {
    sessionStorage.removeItem("upasyo_cms_admin_auth");
  }
}

// Verify entered passcode against CMS admin passcode
export function verifyCmsAdminPasscode(passcode: string): boolean {
  return passcode.trim() === CMS_ADMIN_PASSCODE;
}

// Save Resume Data to Firestore and cache in localStorage - ONLY for person with proper CMS admin passcode
export async function saveResumeData(data: ResumeData, adminPasscodeAttempt?: string): Promise<boolean> {
  const isAuth = isCmsAdminAuthenticated() || (adminPasscodeAttempt ? verifyCmsAdminPasscode(adminPasscodeAttempt) : false);
  if (!isAuth) {
    throw new Error("UNAUTHORIZED_ACCESS: Only the person with the proper correct passcode of CMS admin can edit and save the CV.");
  }

  localStorage.setItem("upasyo_resume_data", JSON.stringify(data));
  try {
    await updateOrCreateDoc(COLLECTIONS.RESUME, "default", data);
    return true;
  } catch (err) {
    console.warn("Failed to persist resume to Firestore, saved to local cache:", err);
    return true;
  }
}
