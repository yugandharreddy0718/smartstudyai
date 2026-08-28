import 'package:flutter/material.dart';
import '../../domain/lesson_model.dart';
import '../../../ai_studio/presentation/ai_summary_dialog.dart';
import '../../../ai_studio/presentation/important_questions_screen.dart';
import '../../../ai_studio/presentation/mcq_generator_screen.dart';
import '../../../ai_studio/presentation/ai_tutor_screen.dart';
import '../../../ai_studio/presentation/pdf_viewer_screen.dart';

class AIStudioToolbar extends StatelessWidget {
  final LessonModel lesson;

  const AIStudioToolbar({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.4),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            ActionChip(
              avatar: const Icon(Icons.auto_awesome, size: 16),
              label: const Text('AI Summary'),
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  builder: (ctx) => AISummaryDialog(
                    lessonId: lesson.id,
                    title: lesson.title,
                    content: lesson.contentMarkdown,
                  ),
                );
              },
            ),
            const SizedBox(width: 8),
            ActionChip(
              avatar: const Icon(Icons.quiz, size: 16),
              label: const Text('Important Q&A'),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (ctx) => ImportantQuestionsScreen(
                      lessonId: lesson.id,
                      title: lesson.title,
                      content: lesson.contentMarkdown,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(width: 8),
            ActionChip(
              avatar: const Icon(Icons.check_circle_outline, size: 16),
              label: const Text('MCQ Generator'),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (ctx) => MCQGeneratorScreen(
                      lessonId: lesson.id,
                      title: lesson.title,
                      content: lesson.contentMarkdown,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(width: 8),
            ActionChip(
              avatar: const Icon(Icons.smart_toy, size: 16),
              label: const Text('AI Tutor'),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (ctx) => AITutorScreen(
                      lessonContext: lesson.contentMarkdown,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(width: 8),
            ActionChip(
              avatar: const Icon(Icons.picture_as_pdf, size: 16),
              label: const Text('PDF Notes'),
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (ctx) => PDFViewerScreen(
                      title: lesson.title,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
