import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/curriculum_provider.dart';
import '../../authentication/providers/auth_state_provider.dart';

class SubjectListScreen extends ConsumerWidget {
  final String? classId;

  const SubjectListScreen({super.key, this.classId});

  IconData _getSubjectIcon(String id) {
    final clean = id.toLowerCase();
    if (clean.contains('math')) return Icons.calculate_rounded;
    if (clean.contains('phys')) return Icons.bolt_rounded;
    if (clean.contains('chem')) return Icons.science_rounded;
    if (clean.contains('bio')) return Icons.eco_rounded;
    if (clean.contains('hist')) return Icons.history_edu_rounded;
    if (clean.contains('geo')) return Icons.public_rounded;
    return Icons.menu_book_rounded;
  }

  Color _getSubjectColor(String id) {
    final clean = id.toLowerCase();
    if (clean.contains('math')) return const Color(0xFF4F46E5);
    if (clean.contains('phys')) return const Color(0xFF0284C7);
    if (clean.contains('chem')) return const Color(0xFF059669);
    if (clean.contains('bio')) return const Color(0xFF16A34A);
    if (clean.contains('hist')) return const Color(0xFFD97706);
    if (clean.contains('geo')) return const Color(0xFFDC2626);
    return const Color(0xFF4F46E5);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final userGrade = authState.user?.grade ?? '8';
    final activeClass = classId ?? 'class_$userGrade';

    final subjectsAsync = ref.watch(subjectsProvider(activeClass));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Learning Library',
              style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w800, fontSize: 20),
            ),
            Text(
              'Grade $userGrade Standard Curriculum',
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Icon(Icons.search_rounded, color: Color(0xFF0F172A), size: 20),
            ),
            onPressed: () => context.push('/search'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: subjectsAsync.when(
        data: (subjects) {
          if (subjects.isEmpty) {
            return const Center(child: Text('No subjects available.'));
          }
          return GridView.builder(
            padding: const EdgeInsets.all(20),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
              childAspectRatio: 0.95,
            ),
            itemCount: subjects.length,
            itemBuilder: (context, index) {
              final subject = subjects[index];
              final color = _getSubjectColor(subject.id);
              final icon = _getSubjectIcon(subject.id);
              final progress = subject.totalLessons > 0 ? (subject.completedLessons / subject.totalLessons).clamp(0.0, 1.0) : 0.0;

              return InkWell(
                onTap: () {
                  context.push('/chapters', extra: {'classId': activeClass, 'subject': subject});
                },
                borderRadius: BorderRadius.circular(28),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: const Color(0xFFF1F5F9)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Icon(icon, color: color, size: 26),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${subject.totalChapters} Ch',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            subject.name,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF0F172A)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: LinearProgressIndicator(
                              value: progress,
                              backgroundColor: const Color(0xFFF1F5F9),
                              color: color,
                              minHeight: 5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${(progress * 100).round()}% Completed',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5))),
        error: (e, st) => Center(child: Text('Error loading subjects: $e')),
      ),
    );
  }
}
