# SMARTSTUDY AI — WEB vs FLUTTER MOBILE PARITY MATRIX

| Feature Area | Feature | Web | Mobile | Same Backend | Same Data Model | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | Email & Password Registration | Supported | Supported | Yes (Firebase Auth) | Yes (`/users/{uid}`) | **PASS** |
| **Authentication** | Email & Password Login | Supported | Supported | Yes (Firebase Auth) | Yes (`/users/{uid}`) | **PASS** |
| **Authentication** | Password Reset | Supported | Supported | Yes (Firebase Auth) | N/A | **PASS** |
| **Authentication** | Guest Sign-In | Supported | Supported | Yes (Firebase Auth) | Yes (`/users/{uid}`) | **PASS** |
| **Authentication** | Google Sign-In | Supported | Supported | Yes (Firebase Auth) | Yes (`/users/{uid}`) | **PASS** |
| **Authentication** | Logout & Session Clear | Supported | Supported | Yes (Firebase Auth) | Yes | **PASS** |
| **Profile** | Name / Display Name | Supported | Supported | Yes (Firestore) | Yes (`displayName`/`name`) | **PASS** |
| **Profile** | Student Class / Grade | Supported | Supported | Yes (Firestore) | Yes (`studentClass`/`grade`) | **PASS** |
| **Profile** | XP Gamification Increment | Supported | Supported | Yes (Firestore) | Yes (`xp`) | **PASS** |
| **Profile** | Level Calculation | Supported | Supported | Yes (Firestore) | Yes (`level`) | **PASS** |
| **Profile** | Streak Tracking | Supported | Supported | Yes (Firestore) | Yes (`streak`/`dailyStreak`) | **PASS** |
| **Profile** | Completed Lessons List | Supported | Supported | Yes (Firestore) | Partial (Web subcol, Mobile doc) | **PARTIAL** |
| **Curriculum** | Classes 6 to 10 Selection | Supported | Supported | Yes | Yes | **PASS** |
| **Curriculum** | 6 Subjects Grid Navigation | Supported | Supported | Yes | Yes | **PASS** |
| **Curriculum** | 178 Chapters Structure | Supported (178) | Firestore Dependent | Yes | Yes | **PARTIAL** |
| **Curriculum** | 444 Lessons Catalog | Supported (444) | Firestore Dependent | Yes | Yes | **PARTIAL** |
| **Curriculum** | Offline Static Curriculum Fallback | Supported (444) | Missing | N/A | N/A | **MISSING** |
| **Lesson Reader** | 13-Section Pedagogical Structure | Supported | Supported | Yes | Yes | **PASS** |
| **Lesson Reader** | Markdown & Math Rendering | Supported (KaTeX) | Supported (flutter_markdown) | N/A | Yes | **PASS** |
| **Lesson Reader** | Reading Time & Scroll Progress | Supported | Supported | Yes | Yes | **PASS** |
| **AI Studio** | AI Summary Tool | Supported | Missing | Yes (`/api/gemini/summary`) | N/A | **MISSING** |
| **AI Studio** | High-Yield Important Q&A Generator | Supported | Missing | Yes (`/api/gemini/important-questions`) | N/A | **MISSING** |
| **AI Studio** | Standalone MCQ Generator | Supported | Missing | Yes (`/api/gemini/mcq-generator`) | N/A | **MISSING** |
| **AI Studio** | Interactive Quiz Assessment | Supported | Missing | Yes (`/api/gemini/quiz`) | N/A | **MISSING** |
| **AI Studio** | 24/7 AI Tutor Chat Assistant | Supported | Missing | Yes (`/api/gemini/chat`) | N/A | **MISSING** |
| **Document Tools**| OCR & Multimodal Image/Doc Upload | Supported | Missing | Yes (`/api/gemini/multimodal`) | N/A | **MISSING** |
| **Document Tools**| PDF Reader & Viewer Studio | Supported | Missing | N/A | N/A | **MISSING** |
| **Search** | Global Curriculum Index Search | Supported | Missing UI | Yes | Yes | **MISSING** |
| **Admin** | Secure Role Separation & Route Guard | Supported | Supported (Backend/Firestore) | Yes | Yes | **PASS** |

---
**Summary Count**:
- **PASS**: 17
- **PARTIAL**: 3
- **MISSING**: 9
- **INCONSISTENT**: 0
