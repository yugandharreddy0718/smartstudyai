# SmartStudy AI — Web vs Flutter Mobile Screen Parity Audit

This document provides a comprehensive screen-by-screen audit comparing the canonical Web application (`web/src`) with the rebuilt Flutter Android mobile application (`mobile/lib`).

---

## 1. Authentication & Onboarding Flow

| Screen / Feature | Web Reference (`web/src`) | Flutter Mobile Implementation (`mobile/lib`) | Visual Parity | Functional Parity | Fixes Applied | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **Startup Auth Check** | `App.tsx` router guards | `app_router.dart` | ✅ Yes | ✅ Yes | Enforced strict login requirement. Unauthenticated users land directly on `/login`. | Verified |
| **Login Screen** | `Login.tsx` | `login_screen.dart` | ✅ Yes | ✅ Yes | Matching `bg-slate-50`, rounded cards (`rounded-[2rem]`), email/password inputs, Google Sign-In, error banners. | Verified |
| **Register Screen** | `Register.tsx` | `register_screen.dart` | ✅ Yes | ✅ Yes | Name, Email, Password fields, Grade Selection chips (G6–G10), Firebase registration. | Verified |
| **Forgot Password** | `ForgotPassword.tsx` | `forgot_password_screen.dart` | ✅ Yes | ✅ Yes | Password reset link dispatch with error and success banners. | Verified |

---

## 2. Main Navigation & Shell Architecture

| Screen / Feature | Web Reference (`web/src`) | Flutter Mobile Implementation (`mobile/lib`) | Visual Parity | Functional Parity | Fixes Applied | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **Mobile Bottom Navigation** | `Shell.tsx` | `custom_bottom_nav.dart` | ✅ Yes | ✅ Yes | Updated to 5 tabs: Home (`/dashboard`), Learn (`/subjects`), Upload (`/upload`), AI Tutor (`/ai-tutor`), Profile (`/profile`). | Verified |
| **Tab Persistence** | Persistent layout container | `DashboardView` & Router | ✅ Yes | ✅ Yes | Bottom navigation bar stays active across main tabs with smooth transition. | Verified |

---

## 3. Dashboard Screen

| Screen / Feature | Web Reference (`web/src`) | Flutter Mobile Implementation (`mobile/lib`) | Visual Parity | Functional Parity | Fixes Applied | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **User Header** | `Dashboard.tsx` header | `user_header_widget.dart` | ✅ Yes | ✅ Yes | Avatar, "Welcome back, {FirstName}", Grade badge, tap to open `/profile`. | Verified |
| **Stats Row (XP/Streak)** | `Dashboard.tsx` stats | `xp_streak_cards.dart` | ✅ Yes | ✅ Yes | Total XP, Level, and Day Streak cards with amber stars and fire icons. | Verified |
| **Hero Banner** | `Dashboard.tsx` hero | `continue_learning_card.dart` | ✅ Yes | ✅ Yes | Dark Slate 900 card (`rounded-[2rem]`), recommended curriculum, "Explore Subjects" button. | Verified |
| **Learning Streams Grid** | `Dashboard.tsx` subjects grid | `subject_grid.dart` | ✅ Yes | ✅ Yes | 6 canonical subjects (Maths, Physics, Chemistry, Biology, History, Geography) with progress bars. | Verified |
| **AI Hub Banner** | `Dashboard.tsx` AI CTA | `dashboard_view.dart` | ✅ Yes | ✅ Yes | Multimodal OCR & AI Tutor launch banner linking to Upload Hub. | Verified |

---

## 4. User Profile & Grade Selection

| Screen / Feature | Web Reference (`web/src`) | Flutter Mobile Implementation (`mobile/lib`) | Visual Parity | Functional Parity | Fixes Applied | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **Profile Header** | `Profile.tsx` header | `profile_screen.dart` | ✅ Yes | ✅ Yes | Avatar, Level badge, Name, Email, Grade tag, Scholar badge, Student ID, Logout button. | Verified |
| **Active Grade Selector** | `Profile.tsx` grade grid | `profile_screen.dart` | ✅ Yes | ✅ Yes | G6, G7, G8, G9, G10 grade buttons. Tapping updates Firestore `/users/{uid}` and re-calibrates curriculum. | Verified |
| **Badges & Stats** | `Profile.tsx` badges | `profile_screen.dart` | ✅ Yes | ✅ Yes | 6 achievement badges (Streak, Math Pro, Reading Owl, Creative, Fast Learner, Overachiever). | Verified |

---

## 5. Curriculum & Lesson Reader

| Screen / Feature | Web Reference (`web/src`) | Flutter Mobile Implementation (`mobile/lib`) | Visual Parity | Functional Parity | Fixes Applied | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **Subject Library** | `SubjectList.tsx` | `subject_list_screen.dart` | ✅ Yes | ✅ Yes | Displays active grade subjects with completion percentages and chapter counters. | Verified |
| **Chapter List** | `ChapterList.tsx` | `chapter_list_screen.dart` | ✅ Yes | ✅ Yes | Grade header badge, "Switch Grade" bottom sheet modal, chapter cards with descriptions. | Verified |
| **Lesson List** | `ChapterList.tsx` | `lesson_list_screen.dart` | ✅ Yes | ✅ Yes | Lesson cards, estimated study time, completion checkmarks (+100 XP badge). | Verified |
| **Lesson Reader** | `LessonDetailsScreen.tsx` | `lesson_reader_screen.dart` | ✅ Yes | ✅ Yes | Markdown math renderer, scroll progress bar, "Mark as Complete (+100 XP)" button updating Firestore subcollection `/users/{uid}/lessonProgress/{lessonId}`. | Verified |
| **Learning Studio Toolbar** | `LessonDetailsScreen.tsx` toolbar | `ai_studio_toolbar.dart` | ✅ Yes | ✅ Yes | Quick action chips: AI Summary, Important Q&A, MCQ Generator, AI Tutor, PDF Notes. | Verified |

---

## 6. AI Studio Services & Multimodal OCR

| Screen / Feature | Web Reference (`web/src`) | Flutter Mobile Implementation (`mobile/lib`) | Visual Parity | Functional Parity | Fixes Applied | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **AI Summary** | `geminiService.ts` summary | `ai_summary_dialog.dart` | ✅ Yes | ✅ Yes | Connected `/api/gemini/summary` with payload `{ text: content }` and `res['result']`. | Verified |
| **Important Q&A** | `geminiService.ts` questions | `important_questions_screen.dart` | ✅ Yes | ✅ Yes | Connected `/api/gemini/important-questions`, mark category chips (1M, 2M, 3M, 5M). | Verified |
| **MCQ Generator** | `geminiService.ts` mcq | `mcq_generator_screen.dart` | ✅ Yes | ✅ Yes | Eliminated all escaped string template bugs (`\${...}`). Active quiz & score summary with explanations. | Verified |
| **AI Tutor Chat** | `AIChat.tsx` | `ai_tutor_screen.dart` | ✅ Yes | ✅ Yes | Connected `/api/gemini/chat` with `{ history, message }`, Markdown formatting, auto-scroll. | Verified |
| **Upload OCR Hub** | `Upload.tsx` | `upload_ocr_screen.dart` | ✅ Yes | ✅ Yes | Base64 file picker sending `{ fileData: { mimeType, data } }` to `/api/gemini/multimodal`. Extracted text, summary & quiz tabs. | Verified |
| **PDF Viewer** | PDF viewer | `pdf_viewer_screen.dart` | ✅ Yes | ✅ Yes | Fixed page counter string interpolation bugs (`\$_currentPage`), page controls, clipboard copy. | Verified |

---

## 7. Search Feature

| Screen / Feature | Web Reference (`web/src`) | Flutter Mobile Implementation (`mobile/lib`) | Visual Parity | Functional Parity | Fixes Applied | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **Curriculum Search** | `SubjectList.tsx` search | `search_screen.dart` | ✅ Yes | ✅ Yes | Real-time search across 178 chapters & 444 lessons across Grades 6–10 with direct navigation to `/lesson_reader`. | Verified |
