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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildActionChip(
              context,
              icon: Icons.auto_awesome_rounded,
              label: 'AI Summary',
              color: const Color(0xFF4F46E5),
              bg: const Color(0xFFEEF2FF),
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
            _buildActionChip(
              context,
              icon: Icons.assignment_rounded,
              label: 'Important Q&A',
              color: const Color(0xFF0284C7),
              bg: const Color(0xFFE0F2FE),
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
            _buildActionChip(
              context,
              icon: Icons.quiz_rounded,
              label: 'MCQ Generator',
              color: const Color(0xFF059669),
              bg: const Color(0xFFECFDF5),
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
            _buildActionChip(
              context,
              icon: Icons.psychology_rounded,
              label: 'AI Tutor',
              color: const Color(0xFFD97706),
              bg: const Color(0xFFFFFBEB),
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
            _buildActionChip(
              context,
              icon: Icons.picture_as_pdf_rounded,
              label: 'PDF Notes',
              color: const Color(0xFFDC2626),
              bg: const Color(0xFFFEF2F2),
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

  Widget _buildActionChip(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required Color bg,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color),
            ),
          ],
        ),
      ),
    );
  }
}
