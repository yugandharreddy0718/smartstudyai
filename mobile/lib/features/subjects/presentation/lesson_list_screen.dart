import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../domain/subject_model.dart';
import '../domain/chapter_model.dart';
import '../providers/curriculum_provider.dart';

class LessonListScreen extends ConsumerWidget {
  final String classId;
  final SubjectModel subject;
  final ChapterModel chapter;

  const LessonListScreen({super.key, required this.classId, required this.subject, required this.chapter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lessonsAsync = ref.watch(lessonsProvider(ChapterRequest(classId, subject.id, chapter.id)));

    return Scaffold(
      appBar: AppBar(
        title: Text(chapter.title),
      ),
      body: lessonsAsync.when(
        data: (lessons) {
          if (lessons.isEmpty) return const Center(child: Text('No lessons available.'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: lessons.length,
            itemBuilder: (context, index) {
              final lesson = lessons[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                    child: Text('${index + 1}', style: TextStyle(color: Theme.of(context).colorScheme.primary)),
                  ),
                  title: Text(lesson.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${lesson.estimatedMinutes} mins estimated'),
                  trailing: const Icon(Icons.play_circle_fill, color: Colors.green),
                  onTap: () {
                    context.push('/lesson_reader', extra: lesson);
                  },
                ),
              ).animate().fade().slideY(begin: 0.1, delay: Duration(milliseconds: index * 100));
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
