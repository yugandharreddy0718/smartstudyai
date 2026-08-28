import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/ai_providers.dart';

class ImportantQuestionsScreen extends ConsumerWidget {
  final String lessonId;
  final String title;
  final String content;

  const ImportantQuestionsScreen({
    super.key,
    required this.lessonId,
    required this.title,
    required this.content,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final req = LessonAiRequest(lessonId: lessonId, title: title, content: content);
    final questionsAsync = ref.watch(importantQuestionsProvider(req));

    return Scaffold(
      appBar: AppBar(
        title: const Text('High-Yield Important Q&A'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(importantQuestionsProvider(req)),
          ),
        ],
      ),
      body: questionsAsync.when(
        data: (questions) {
          if (questions.isEmpty) {
            return const Center(child: Text('No questions available.'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: questions.length,
            itemBuilder: (context, idx) {
              final q = questions[idx];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: ExpansionTile(
                  leading: Chip(
                    label: Text(
                      q.markCategory,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  ),
                  title: Text(
                    q.question,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Model Answer:',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
                          ),
                          const SizedBox(height: 4),
                          Text(q.answer, style: const TextStyle(fontSize: 14)),
                          if (q.markingPoints.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            const Text(
                              'Key Marking Points:',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.teal),
                            ),
                            const SizedBox(height: 4),
                            ...q.markingPoints.map((pt) => Row(
                                  children: [
                                    const Icon(Icons.check_circle, size: 14, color: Colors.teal),
                                    const SizedBox(width: 6),
                                    Expanded(child: Text(pt, style: const TextStyle(fontSize: 13))),
                                  ],
                                )),
                          ]
                        ],
                      ),
                    )
                  ],
                ),
              );
            },
          );
        },
        loading: () => const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Generating High-Yield Exam Questions...'),
            ],
          ),
        ),
        error: (err, st) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 12),
              Text('Failed to generate Q&A: $err', textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.refresh(importantQuestionsProvider(req)),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
