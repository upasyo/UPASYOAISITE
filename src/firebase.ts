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
  serverTimestamp
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

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
  KNOWLEDGE_BASE: "knowledgeBase"
};

// Seeding Data
export const SEED_DATA = {
  siteSettings: {
    id: "default",
    brandName: "UPASYO",
    logoStyle: "animated-neural-glow",
    footerText: "© 2026 UPASYO. All cognitive assets and research algorithms reserved.",
    themePalette: "Pastel Pink Accent Theme",
    primaryColor: "#ffffff",
    accentColor: "#fbcfe8"
  },
  heroSection: {
    id: "default",
    title: "Deciphering the Code of intelligence",
    subtitle: "AI Scientist & Core Researcher in Foundation Models",
    description: "Pioneering the intersection of deep scaling laws, structural reasoning, and artificial general intelligence. Building transparent, mathematically rigorous neural architectures for modern cognitive science.",
    resumeUrl: "#",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  aboutSection: {
    id: "default",
    bio: "UPASYO is an AI Scientist dedicated to expanding the boundaries of biological and artificial mind structures. Combining a deep mathematical rigor with scalable neural paradigms, they specialize in the training dynamics of massive transformers, interpretability matrices, and structural grounding layers that prevent factual collision under heavy inference.",
    skills: [
      "Transformer Weight Optimization",
      "Dynamic Routing & Mixture of Experts (MoE)",
      "Reinforcement Learning with AI Feedback (RLAIF)",
      "Neuro-Symbolic Cognitive Pipelines",
      "Interpretability latent space probing",
      "Distributed Cluster TPU Scaling"
    ]
  },
  researchVision: {
    id: "default",
    title: "Towards Mechanistic Interpretability & Safe Multi-Modal Alignment",
    paragraph1: "The goal of AI science is not merely to compile deeper architectures, but to decode the mathematical rules that govern their emergent logic. If a network possesses billions of synapses, we must build transparent, active pathways to audit, steer, and verify its logical processes in real-time.",
    paragraph2: "By combining neuro-symbolic reasoning frameworks with dense token mapping paradigms, we can develop cognitive systems that think abstractly, reason factually, and align harmoniously with human survival principles."
  },
  researchAreas: [
    {
      id: "area1",
      title: "Associative Cognitive Matrix (RAG)",
      description: "Developing next-generation retrieval systems that maintain hierarchical knowledge topologies directly within attention layers.",
      icon: "BrainCircuit",
      order: 1
    },
    {
      id: "area2",
      title: "Self-Verbatim Scaling Safeguards",
      description: "Constructing mathematical safeguards that evaluate and bound model outputs against contradictory alignment constraints.",
      icon: "ShieldAlert",
      order: 2
    },
    {
      id: "area3",
      title: "Neuro-Symbolic Grounding Layers",
      description: "Injecting explicit logic engines and state-transition models directly into transformer attention layers.",
      icon: "Cpu",
      order: 3
    }
  ],
  projects: [
    {
      id: "proj1",
      title: "Project NeuralLink-X",
      subtitle: "Sparse-Dense Semantic Associator",
      description: "Developed a groundbreaking hybrid vector storage engine that binds multi-layered semantic graphs to transformer weights, eliminating retrieval friction and multi-hop hallucinations.",
      tags: ["PyTorch", "Rust", "VectorDB", "Gemini API"],
      github: "https://github.com",
      demo: "https://demo.com",
      impact: "Reduced memory retrieval footprint by 42% while retaining 98.7% topological fidelity.",
      order: 1
    },
    {
      id: "proj2",
      title: "OptiScale-V5",
      subtitle: "Multi-Clustered Scaling Director",
      description: "An open-source distributed training compiler designed to compute optimal weight partitioning matrices automatically across 5,000+ TPU shards.",
      tags: ["Jax", "Trident Core", "TPU Routing"],
      github: "https://github.com",
      demo: "https://demo.com",
      impact: "Achieved a 24% boost in energetic efficiency on models exceeding 120 billion parameters.",
      order: 2
    }
  ],
  publications: [
    {
      id: "pub1",
      title: "Decoupled Latent State Optimization in Generative Attention Matrices",
      authors: "UPASYO, A. Vance, E. Horvitz",
      venue: "International Conference on Machine Learning (ICML) 2026",
      url: "#",
      date: "2026-05-12",
      order: 1
    },
    {
      id: "pub2",
      title: "Neuro-Symbolic Safeguards: Bounding Logic Failures in Generative Reasoning Pools",
      authors: "UPASYO, S. Russel, Y. Bengio",
      venue: "Journal of Artificial Intelligence Research (JAIR) 2025",
      url: "#",
      date: "2025-11-20",
      order: 2
    }
  ],
  achievements: [
    {
      id: "ach1",
      title: "Dynamic Scholar in AI Foundations (2025)",
      issuer: "Global Consortium of Cognitive Science",
      description: "Awarded for exceptional contributions to the development of self-verifying scaling laws.",
      order: 1
    },
    {
      id: "ach2",
      title: "Top 100 Visionary Core Researcher",
      issuer: "IEEE Intelligent Systems Group",
      description: "Nominated among key rising leaders globally in neuromorphic modeling and safety algorithms.",
      order: 2
    }
  ],
  blogPosts: [
    {
      id: "blog1",
      title: "The Next 100x: Why scaling laws require structured reasoning loops",
      category: "Deep Learning",
      date: "2026-06-12",
      readingTime: "5 min",
      summary: "Exploring why simple next-token predictability faces an asymptotic ceiling, and why explicit neuro-symbolic runtime tracking is the key to deep reasoning.",
      content: "## The Scaling Horizon\n\nFor nearly a decade, scaling laws have dominated artificial intelligence. Double the parameter size, triple the token tokens, and compute power outputs soar. But next-token predictions are ultimately a compression trick.\n\n### The Reason Loop\n\nTo cross into authentic reasoning: We need active structural routing models that check mathematical consistency *during* the attention step rather than attempting post-hoc corrections. By binding symbolic trees directly to latent vectors, UPASYO's recent paper introduces dynamic safeguards to keep predictions consistent, fact-grounded, and mathematically sound.",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600",
      order: 1
    },
    {
      id: "blog2",
      title: "A Primer on Associative RAG Matrices for Lifelong Agents",
      category: "Information Retrieval",
      date: "2026-04-05",
      readingTime: "8 min",
      summary: "An introduction to mapping multi-layered semantic directories directly onto sparse transformer activation states, enabling perpetual context retention.",
      content: "## The Stateful Agent Dilemma\n\nRetrieval-Augmented Generation (RAG) is usually viewed as an external utility database. But why treat contextual memory like a static folder?\n\n### Associative Activation\n\nBy building sparse activation coordinates, we can cache historical conversational milestones directly inside the transformer's latent layers. Over time, recurring thoughts form structured neural networks that self-anchor without expanding the attention window infinitely.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
      order: 2
    }
  ],
  knowledgeBase: [
    {
      id: "k1",
      content: "UPASYO is an elite AI Scientist specializing in deep learning scaling laws, neuro-symbolic reasoning, and cognitive retrieval architectures.",
      category: "General Biography"
    },
    {
      id: "k2",
      content: "UPASYO has authored papers like 'Decoupled Latent State Optimization' at ICML 2026 and 'Neuro-Symbolic Safeguards' in JAIR 2025.",
      category: "Publications"
    },
    {
      id: "k3",
      content: "UPASYO developed Project NeuralLink-X, a sparse-dense semantic RAG engine in PyTorch and Rust that minimizes retrieval errors and hallucinations.",
      category: "Projects"
    },
    {
      id: "k4",
      content: "UPASYO developed OptiScale-V5, a distributed training compiler designed in Jax to partition weights automatically across massive TPU clusters.",
      category: "Projects"
    },
    {
      id: "k5",
      content: "UPASYO believes that AI modeling should involve mechanistic interpretability combined with solid logical verification layers rather than pure black-box scaling.",
      category: "Philosophy"
    },
    {
      id: "k6",
      content: "UPASYO received the Dynamic Scholar in AI Foundations (2025) and is ranked among the Top 100 Visionary Core Researchers by IEEE.",
      category: "Achievements"
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
    
    console.log("Empty database detected! Initiating elite seeding sequence...");

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
    
    console.log("Firebase database seeded successfully with world-class researcher profile!");
  } catch (error) {
    console.error("Database Seeding Failed:", error);
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

// Submit contact form message in Firestore
export async function submitContactMessage(name: string, email: string, subject: string, message: string) {
  try {
    const colRef = collection(db, COLLECTIONS.CONTACT_MESSAGES);
    await addDoc(colRef, {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error("Error submitting contact message to firestore:", err);
    throw err;
  }
}
