export const testData = {
  user: {
    name: 'SmartStudy Student',
    email: process.env.TEST_EMAIL || 'student@smartstudy.ai',
    password: process.env.TEST_PASSWORD || 'Password123!',
    invalidEmail: 'invalid.user@smartstudy.ai',
    invalidPassword: 'WrongPassword999'
  },
  grades: [
    { name: 'Class 6', id: 6, subjectsCount: 6, sampleSubject: 'Mathematics' },
    { name: 'Class 7', id: 7, subjectsCount: 6, sampleSubject: 'Physics' },
    { name: 'Class 8', id: 8, subjectsCount: 6, sampleSubject: 'Chemistry' },
    { name: 'Class 9', id: 9, subjectsCount: 6, sampleSubject: 'Biology' },
    { name: 'Class 10', id: 10, subjectsCount: 6, sampleSubject: 'History & Civics' }
  ],
  searchQuery: 'Gravity',
  aiPrompts: {
    summary: 'Provide a quick high-yield summary of gravitational force.',
    question: 'What is Newton universal law of gravitation?',
    mcqCount: 5,
    mcqDifficulty: 'Medium'
  }
};
