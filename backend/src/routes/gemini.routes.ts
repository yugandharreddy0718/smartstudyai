import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  generateSummary,
  generateMultimodal,
  generateQuiz,
  generateFlashcards,
  generateTopics,
  generateExplanation,
  chatWithTutor,
  generateImportantQuestions
} from '../controllers/gemini.controller.js';

const router = Router();

router.use(requireAuth);


router.post('/summary', generateSummary);
router.post('/multimodal', generateMultimodal);
router.post('/quiz', generateQuiz);
router.post('/flashcards', generateFlashcards);
router.post('/topics', generateTopics);
router.post('/explanation', generateExplanation);
router.post('/chat', chatWithTutor);
router.post('/important-questions', generateImportantQuestions);
router.post('/mcq-generator', generateQuiz);

export default router;
