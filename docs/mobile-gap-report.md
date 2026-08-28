# SMARTSTUDY AI — MOBILE GAP REPORT & REMEDIATION PLAN

## Overview
This document outlines the functional and technical gaps identified during the Web vs. Flutter Mobile Parity Audit for SmartStudy AI.

---

## Gap Inventory

### GAP-01: Missing AI Features Suite on Mobile (P0 - Critical)
- **Feature**: AI Summary, High-Yield Important Q&A, Standalone MCQ Generator, Interactive Quiz, 24/7 AI Tutor Chat Assistant
- **Web Behavior**: Full interactive UI in Learning Studio calling backend API endpoints `/api/gemini/summary`, `/api/gemini/important-questions`, `/api/gemini/mcq-generator`, `/api/gemini/quiz`, and `/api/gemini/chat`.
- **Mobile Behavior**: Features do not exist in the Flutter mobile application interface.
- **Expected Behavior**: Flutter mobile student application provides access to AI Summary, High-Yield Q&A, MCQ Generator, Quiz, and AI Tutor Chat, connecting to the Express backend API server.
- **Severity**: **P0 (Critical)**
- **Recommended Fix**: Implement Flutter screens and API service calling the Express backend endpoints for AI Summary, MCQ Generator, Important Q&A, Quiz, and AI Tutor Chat.

---

### GAP-02: Missing Document Upload, OCR & PDF Viewer Studio on Mobile (P1 - Major)
- **Feature**: Image/PDF Upload, Multimodal OCR text extraction, PDF Viewer
- **Web Behavior**: Web studio supports uploading PDFs/images, performing OCR extraction, and previewing PDF documents.
- **Mobile Behavior**: No upload or PDF viewing screen exists in `mobile/lib/features/`.
- **Expected Behavior**: Mobile app allows uploading files/taking pictures of notes for OCR extraction and PDF viewing.
- **Severity**: **P1 (Major)**
- **Recommended Fix**: Add document upload & PDF viewer screen in Flutter using `file_picker` and `pdfx` or `flutter_pdfview`.

---

### GAP-03: Missing Offline Static Curriculum Fallback on Mobile (P0 - Critical)
- **Feature**: Curriculum Data Source Reliability (Classes 6–10, 178 Chapters, 444 Lessons)
- **Web Behavior**: Web client includes a local static curriculum index (`web/src/data/curriculum.ts`) containing all 444 lessons across Classes 6–10, guaranteeing immediate availability even when offline or when Firestore is empty.
- **Mobile Behavior**: `FirebaseCurriculumDataSource` relies exclusively on Firestore network queries to `/curriculum/...`. If Firestore is unpopulated or network times out (5s), mobile returns 0 subjects, 0 chapters, and 0 lessons.
- **Expected Behavior**: Mobile app falls back to local static curriculum assets (JSON/Dart dataset matching `curriculum.ts`) when Firestore curriculum docs are empty or offline.
- **Severity**: **P0 (Critical)**
- **Recommended Fix**: Bundle the complete 444-lesson static curriculum dataset into the Flutter mobile application assets/data layer.

---

### GAP-04: Missing Global Curriculum Search Interface on Mobile (P2 - Usability)
- **Feature**: Global Search
- **Web Behavior**: Header search bar allows searching across all 444 lessons, 178 chapters, and subjects with instant navigation to matched lessons.
- **Mobile Behavior**: `subject_list_screen.dart` contains a search icon, but no functional search filter interface or global curriculum index search screen is implemented.
- **Expected Behavior**: Mobile search screen allows searching lesson titles, IDs, and concepts across all active grades.
- **Severity**: **P2 (Usability)**
- **Recommended Fix**: Implement a Search Delegate / Search Screen in Flutter querying the curriculum dataset.

---

### GAP-05: Inconsistent Progress Storage Subcollection Sync (P2 - Data Consistency)
- **Feature**: Progress Data Storage Model
- **Web Behavior**: Web client writes progress to `/users/{uid}/lessonProgress/{lessonId}` subcollection and mirrors array `completedLessons` on user profile document.
- **Mobile Behavior**: Mobile reads/writes `/users/{uid}` profile stats directly, but does not synchronize with `/users/{uid}/lessonProgress/{lessonId}` subcollection.
- **Expected Behavior**: Web and Mobile read/write the canonical `/users/{uid}/lessonProgress/{lessonId}` subcollection so progress completed on Web instantly reflects on Mobile and vice versa.
- **Severity**: **P2 (Data Consistency)**
- **Recommended Fix**: Align `firebase_progress_data_source.dart` in Flutter to read/write `/users/{uid}/lessonProgress/{lessonId}` subcollection.

---

## Priority Summary
- **P0 Gaps**: 2 (Missing AI Features, Missing Local Curriculum Fallback)
- **P1 Gaps**: 1 (Missing Document Upload & PDF Viewer)
- **P2 Gaps**: 2 (Missing Global Search, Progress Subcollection Sync Alignment)
- **P3 Gaps**: 0
