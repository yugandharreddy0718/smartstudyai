export enum StudentClass {
  C1 = "1", C2 = "2", C3 = "3", C4 = "4", C5 = "5",
  C6 = "6", C7 = "7", C8 = "8", C9 = "9", C10 = "10"
}

export interface UserStats {
  xp: number;
  streak: number;
  level: number;
  badges: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  studentClass: StudentClass;
  createdAt: number;
  lastLogin: number;
  stats: UserStats;
  completedLessons?: string[];
}

export interface Subject {
  id: string;
  name: string;
  class: string;
  icon: string;
  color: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  type: 'pdf' | 'text' | 'image';
  fileUrl?: string;
  ownerId: string;
  aiAnalysis?: AIAnalysis;
  createdAt: number;
}

export interface AIAnalysis {
  summary: string;
  topics: string[];
  explanation: string;
  flashcards: { front: string, back: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: number;
}
