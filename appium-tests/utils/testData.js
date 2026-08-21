export const testData = {
  user: {
    email: process.env.TEST_EMAIL || 'student@smartstudy.ai',
    password: process.env.TEST_PASSWORD || 'SmartStudy2026!'
  },
  grades: [6, 7, 8, 9, 10],
  subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography & Economics'],
  aiQueries: {
    summary: 'Summarize key principles of Photosynthesis in 3 main bullet points.',
    qa: 'Generate top 5 exam questions with model answers for Motion.',
    mcq: { count: 5, difficulty: 'Medium' },
    tutor: 'Can you explain Newton second law of motion with a practical real-world example?'
  }
};
