import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../domain/subject_model.dart';
import '../domain/chapter_model.dart';
import '../providers/curriculum_provider.dart';
import '../../authentication/providers/auth_state_provider.dart';

class LessonListScreen extends ConsumerWidget {
  final String classId;
  final SubjectModel subject;
  final ChapterModel chapter;

  const LessonListScreen({super.key, required this.classId, required this.subject, required this.chapter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final completedLessons = authState.user?.completedLessons ?? [];

    final lessonsAsync = ref.watch(lessonsProvider(ChapterRequest(classId, subject.id, chapter.id)));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => context.pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              chapter.title,
              style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              subject.name,
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
      body: lessonsAsync.when(
        data: (lessons) {
          if (lessons.isEmpty) {
            return const Center(
              child: Text('No lessons available for this chapter.', style: TextStyle(color: Color(0xFF64748B))),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: lessons.length,
            itemBuilder: (context, index) {
              final lesson = lessons[index];
              final isCompleted = completedLessons.contains(lesson.id);

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: isCompleted ? const Color(0xFFA7F3D0) : const Color(0xFFF1F5F9)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 2)),
                  ],
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isCompleted ? const Color(0xFFECFDF5) : const Color(0xFFEEF2FF),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Center(
                      child: Icon(
                        isCompleted ? Icons.check_circle_rounded : Icons.menu_book_rounded,
                        color: isCompleted ? const Color(0xFF10B981) : const Color(0xFF4F46E5),
                        size: 20,
                      ),
                    ),
                  ),
                  title: Text(
                    lesson.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4.0),
                    child: Row(
                      children: [
                        const Icon(Icons.timer_outlined, size: 12, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 4),
                        Text(
                          '${lesson.estimatedMinutes} mins study time',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                        if (isCompleted) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Completed +100 XP',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF047857)),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  trailing: const Icon(Icons.play_circle_fill_rounded, color: Color(0xFF4F46E5), size: 28),
                  onTap: () {
                    context.push('/lesson_reader', extra: {
                      'lesson': lesson,
                      'classId': classId,
                      'subjectId': subject.id,
                    });
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5))),
        error: (e, st) => Center(child: Text('Error loading lessons: $e')),
      ),
    );
  }
}
