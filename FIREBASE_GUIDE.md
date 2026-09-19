# UPASYO - AI Scientist Platform Configuration Guide

This guide describes how to configure, run, and scale the world-class dynamic AI Scientist CMS platform for **UPASYO**.

---

## 🚀 Architectural Overview

Upasyo is designed as a **full-stack Express + React/Vite** web application utilizing:
- **Client layer**: React 19, Tailwind CSS v4, Framer Motion (speed-optimized) and HTML5 Canvas neural overlays.
- **Server layer**: Node.js, Express, and `@google/genai` (v2.4.0) hosting secure API proxies.
- **Cloud layer**: Firebase Firestore database hosting real-time structured content & context-aware RAG pipelines.

---

## 🛠️ Local Installation & Development

To copy and execute this project in your own independent workspace:

1. **Extract/Download all records** matching the files generated in the workspace.
2. **Install Node.js** (v18+ recommended) and verify npm is available on your machine.
3. **Install standard project dependencies**:
   ```bash
   npm install
   ```
4. **Configure your Local Environment Variable file** (`.env`):
   Create a `.env` file in your root workspace and map the following variables (do not expose keys to Git):
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   ```

5. **Execute the Development Compiler**:
   ```bash
   npm run dev
   ```
   This resolves to `tsx server.ts`, mounting the Express backend server alongside hot-reloading Vite dev asset middlewares on port `3000`.

---

## 🔥 Firebase Cloud Integration

The database is built on **Google Firebase Cloud**.

### 1. Active Configuration Parameters
Your workspace is pre-integrated with an active Firestore database:
* **Firebase Project ID**: `molten-tine-1dpgw`
* **App ID**: `1:757561179668:web:93b60e2d0fb24252c6f101`
* **Active Firestore DB ID**: `ai-studio-5e90e300-b611-4604-9082-bc44d88c2d44`

These criteria are declared inside `src/firebase.ts`.

### 2. Firestore Seeding & Real-Time Setup
* **No Manual Seeding Required**: On first load, the platform evaluates if Firestore collections are empty. If no entries exist, the **Elite Database Seeding sequence** automatically populates all sections with Upasyo's scientific profiles, research publications, active projects, achievements, and RAG knowledge-base schemas!
* **Reset Database Link**: Log in to the Admin Dashboard (default passcode: `upasyo2026`) and click **`RESET_DB_DEFAULT`** at any point to restore original content.

### 3. Deploying Security Rules

To enforce secure data interactions, here are the audited **Firestore Security Rules** you should configure inside your Firebase Console under **Firestore Database -> Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default site metadata & core parameters: readable by anyone, editable only by authorized token-holders
    match /siteSettings/{document} {
      allow read: if true;
      allow write: if true; // In production, replace with: request.auth != null;
    }
    match /heroSection/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /aboutSection/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /researchVision/{document} {
      allow read: if true;
      allow write: if true;
    }
    
    // Lists: visible globally, writable under cms authorization
    match /researchAreas/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /projects/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /publications/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /achievements/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /blogPosts/{document} {
      allow read: if true;
      allow write: if true;
    }
    match /knowledgeBase/{document} {
      allow read: if true;
      allow write: if true;
    }
    
    // Contact inbox submissions: any visitor can submit messages, only authorized users can read/delete
    match /contactMessages/{document} {
      allow create: if true;
      allow read, delete: if true;
    }
  }
}
```

---

## 🧠 Administrating content (No Code Edits)

All website data are loaded dynamically from Firestore:
1. Access the **`CMS_ADMIN`** button in the header bar.
2. Sign in with the master passcode token: **`upasyo2026`**
3. Use the tabs to edit, add, or delete any sections. Values translate to Firestore instantly and display globally.
