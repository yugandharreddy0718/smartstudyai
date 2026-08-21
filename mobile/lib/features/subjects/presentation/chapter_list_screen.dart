import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../domain/subject_model.dart';
import '../providers/curriculum_provider.dart';

class ChapterListScreen extends ConsumerWidget {
  final String classId;
  final SubjectModel subject;

  const ChapterListScreen({super.key, required this.classId, required this.subject});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chaptersAsync = ref.watch(chaptersProvider(SubjectRequest(classId, subject.id)));

    return Scaffold(
      appBar: AppBar(
        title: Text(subject.name),
      ),
      body: Column(
        children: [
          Hero(
            tag: 'subject_${subject.id}',
            child: Material(
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    Icon(Icons.menu_book, size: 48, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(subject.name, style: Theme.of(context).textTheme.headlineSmall),
                          Text(subject.description, style: Theme.of(context).textTheme.bodyMedium),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: chaptersAsync.when(
              data: (chapters) {
                if (chapters.isEmpty) return const Center(child: Text('No chapters available.'));
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: chapters.length,
                  itemBuilder: (context, index) {
                    final chapter = chapters[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        title: Text(chapter.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(chapter.description),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          context.push('/lessons', extra: {
                            'classId': classId,
                            'subject': subject,
                            'chapter': chapter,
                          });
                        },
                      ),
                    ).animate().fade().slideX(begin: 0.1, delay: Duration(milliseconds: index * 100));
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, st) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}
