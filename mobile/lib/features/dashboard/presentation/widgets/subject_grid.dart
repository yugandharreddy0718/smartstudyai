import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../subjects/domain/subject_model.dart';
import '../../../authentication/providers/auth_state_provider.dart';

class SubjectGrid extends ConsumerWidget {
  final List<SubjectModel> subjects;

  const SubjectGrid({super.key, required this.subjects});

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
    if (subjects.isEmpty) return const SizedBox.shrink();

    final userGrade = ref.watch(authStateProvider).user?.grade ?? '8';
    final classId = 'class_$userGrade';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Learning Streams',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.3,
                ),
              ),
              TextButton(
                onPressed: () => context.push('/subjects'),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  'View All',
                  style: TextStyle(
                    color: Color(0xFF4F46E5),
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.98,
            ),
            itemCount: subjects.length,
            itemBuilder: (context, index) {
              final subject = subjects[index];
              return _buildSubjectCard(context, subject, classId);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectCard(BuildContext context, SubjectModel subject, String classId) {
    final color = _getSubjectColor(subject.id);
    final icon = _getSubjectIcon(subject.id);
    final progress = subject.totalLessons > 0
        ? (subject.completedLessons / subject.totalLessons).clamp(0.0, 1.0)
        : 0.0;
    final pct = (progress * 100).round();

    return InkWell(
      onTap: () {
        context.push('/chapters', extra: {
          'classId': classId,
          'subject': subject,
        });
      },
      borderRadius: BorderRadius.circular(22),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFFF1F5F9)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top Row: Icon Container + Percentage Pill
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '$pct%',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: color,
                    ),
                  ),
                ),
              ],
            ),
            // Bottom Info Block: Title, Progress Bar, Lessons count
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  subject.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 8),
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
                  '${subject.completedLessons}/${subject.totalLessons} Lessons Done',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Color(0xFF94A3B8),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
