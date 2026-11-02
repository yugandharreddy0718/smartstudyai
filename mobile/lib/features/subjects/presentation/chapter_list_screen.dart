import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';
import '../domain/subject_model.dart';
import '../providers/curriculum_provider.dart';
import '../../authentication/providers/auth_state_provider.dart';

class ChapterListScreen extends ConsumerStatefulWidget {
  final String classId;
  final SubjectModel subject;

  const ChapterListScreen({super.key, required this.classId, required this.subject});

  @override
  ConsumerState<ChapterListScreen> createState() => _ChapterListScreenState();
}

class _ChapterListScreenState extends ConsumerState<ChapterListScreen> {
  Future<void> _showGradeModal(BuildContext context, String currentGrade) async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Grade Level',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Color(0xFF94A3B8)),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...['6', '7', '8', '9', '10'].map((g) {
              final isCurrent = currentGrade == g;
              return ListTile(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                tileColor: isCurrent ? const Color(0xFFEEF2FF) : Colors.transparent,
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isCurrent ? const Color(0xFF4F46E5) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    'G$g',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isCurrent ? Colors.white : const Color(0xFF475569),
                    ),
                  ),
                ),
                title: Text('Grade $g Standard Curriculum', style: const TextStyle(fontWeight: FontWeight.bold)),
                trailing: isCurrent ? const Icon(Icons.check_circle_rounded, color: Color(0xFF4F46E5)) : null,
                onTap: () => Navigator.pop(ctx, g),
              );
            }),
          ],
        ),
      ),
    );

    if (selected != null && selected != currentGrade) {
      final user = ref.read(authStateProvider).user;
      if (user != null) {
        final uid = user.id;
        final firestore = ref.read(firestoreProvider);
        await firestore.collection('users').doc(uid).set({
          'studentClass': selected,
          'grade': selected,
          'updatedAt': DateTime.now().millisecondsSinceEpoch,
        }, SetOptions(merge: true));

        await ref.read(authRepositoryProvider).updateProfile(
          uid: uid,
          studentClass: selected,
          grade: selected,
        );

        final updatedUser = user.copyWith(studentClass: selected);
        ref.read(authStateProvider.notifier).setAuthenticated(updatedUser);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final userGrade = authState.user?.grade ?? '8';
    final activeClass = 'class_$userGrade';

    final chaptersAsync = ref.watch(chaptersProvider(SubjectRequest(activeClass, widget.subject.id)));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => context.pop(),
        ),
        title: Text(
          widget.subject.name,
          style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          TextButton.icon(
            onPressed: () => _showGradeModal(context, userGrade),
            style: TextButton.styleFrom(
              backgroundColor: const Color(0xFFEEF2FF),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            ),
            icon: const Icon(Icons.school_rounded, color: Color(0xFF4F46E5), size: 16),
            label: Text(
              'Grade $userGrade',
              style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.menu_book_rounded, color: Color(0xFF4F46E5), size: 32),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.subject.name,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.subject.description.isNotEmpty ? widget.subject.description : 'Comprehensive curriculum breakdown with AI study tools.',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.3),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),

          Expanded(
            child: chaptersAsync.when(
              data: (chapters) {
                if (chapters.isEmpty) {
                  return const Center(
                    child: Text('No chapters available for this subject.', style: TextStyle(color: Color(0xFF64748B))),
                  );
                }
                return ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: chapters.length,
                  itemBuilder: (context, index) {
                    final chapter = chapters[index];

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFF1F5F9)),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Center(
                            child: Text(
                              '${index + 1}',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4F46E5), fontSize: 16),
                            ),
                          ),
                        ),
                        title: Text(
                          chapter.title,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            chapter.description,
                            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFFCBD5E1)),
                        onTap: () {
                          context.push('/lessons', extra: {
                            'classId': activeClass,
                            'subject': widget.subject,
                            'chapter': chapter,
                          });
                        },
                      ),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5))),
              error: (e, st) => Center(child: Text('Error loading chapters: $e')),
            ),
          ),
        ],
      ),
    );
  }
}
