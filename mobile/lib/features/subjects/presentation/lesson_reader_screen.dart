import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import '../domain/lesson_model.dart';
import '../providers/lesson_progress_provider.dart';
import '../providers/curriculum_provider.dart';
import '../providers/offline_provider.dart';
import '../../authentication/providers/auth_state_provider.dart';
import 'widgets/markdown_math_viewer.dart';
import 'widgets/ai_studio_toolbar.dart';

class LessonReaderScreen extends ConsumerStatefulWidget {
  final LessonModel lesson;
  final String? classId;
  final String? subjectId;

  const LessonReaderScreen({
    super.key,
    required this.lesson,
    this.classId,
    this.subjectId,
  });

  @override
  ConsumerState<LessonReaderScreen> createState() => _LessonReaderScreenState();
}

class _LessonReaderScreenState extends ConsumerState<LessonReaderScreen> {
  final ScrollController _scrollController = ScrollController();
  Timer? _readingTimer;
  int _secondsRead = 0;
  double _progress = 0.0;
  bool _isCompleting = false;
  bool _isLoadingContent = false;
  late LessonModel _activeLesson;

  @override
  void initState() {
    super.initState();
    _activeLesson = widget.lesson;
    _startTimer();
    _scrollController.addListener(_onScroll);

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _fetchLessonContentIfNeeded();

      final progressData = await ref.read(lessonProgressProvider(_activeLesson.id).future);
      if (progressData != null) {
        if (mounted) {
          setState(() {
            _secondsRead = progressData.readingTimeSeconds;
          });
        }
        if (progressData.scrollPosition > 0 && _scrollController.hasClients) {
          _scrollController.jumpTo(progressData.scrollPosition);
        }
      }
    });
  }

  Future<void> _fetchLessonContentIfNeeded() async {
    final needsLoadingIndicator = _activeLesson.contentMarkdown.trim().isEmpty;
    if (needsLoadingIndicator) {
      setState(() {
        _isLoadingContent = true;
      });
    }

    try {
      final authState = ref.read(authStateProvider);
      final userGrade = authState.user?.grade ?? '8';
      final activeClassId = widget.classId ?? 'class_$userGrade';
      final activeSubjectId = widget.subjectId ?? 'general';

      final repo = ref.read(curriculumRepositoryProvider);
      final details = await repo.getLessonDetails(
        activeClassId,
        activeSubjectId,
        _activeLesson.chapterId,
        _activeLesson.id,
      );

      if (mounted && details.contentMarkdown.trim().isNotEmpty && details.contentMarkdown != _activeLesson.contentMarkdown) {
        setState(() {
          _activeLesson = details;
        });
      }
    } catch (e) {
      debugPrint('DEBUG: Error fetching lesson details in LessonReaderScreen: $e');
    } finally {
      if (mounted && needsLoadingIndicator) {
        setState(() {
          _isLoadingContent = false;
        });
      }
    }
  }

  void _startTimer() {
    _readingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsRead++;
      });
      if (_secondsRead % 10 == 0) {
        _saveProgress();
      }
    });
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    if (maxScroll > 0) {
      setState(() {
        _progress = (currentScroll / maxScroll).clamp(0.0, 1.0);
      });
    }
  }

  void _saveProgress() {
    if (!_scrollController.hasClients) return;
    ref.read(lessonProgressNotifierProvider.notifier).saveProgress(
      _activeLesson.id,
      _scrollController.position.pixels,
      _secondsRead,
    );
  }

  Future<void> _handleMarkComplete() async {
    if (_isCompleting) return;
    setState(() => _isCompleting = true);

    try {
      await ref.read(lessonProgressNotifierProvider.notifier).markComplete(_activeLesson.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Lesson completed! +100 XP awarded!'),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving completion: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isCompleting = false);
      }
    }
  }

  @override
  void dispose() {
    _readingTimer?.cancel();
    _saveProgress();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isCachedAsync = ref.watch(isLessonCachedProvider(_activeLesson.id));
    final authState = ref.watch(authStateProvider);
    final isCompleted = authState.user?.completedLessons.contains(_activeLesson.id) ?? false;

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
              _activeLesson.title,
              style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              '${_activeLesson.estimatedMinutes} mins estimated • Interactive Reader',
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4.0),
          child: LinearProgressIndicator(
            value: _progress,
            backgroundColor: const Color(0xFFF1F5F9),
            color: const Color(0xFF4F46E5),
            minHeight: 4,
          ),
        ),
        actions: [
          isCachedAsync.when(
            data: (isCached) => IconButton(
              icon: Icon(isCached ? Icons.offline_pin_rounded : Icons.download_rounded),
              color: isCached ? const Color(0xFF10B981) : const Color(0xFF64748B),
              onPressed: () {
                ref.read(offlineLessonNotifierProvider.notifier).toggleCache(_activeLesson);
              },
            ),
            loading: () => const SizedBox(width: 48, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
            error: (e, st) => const SizedBox(),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          AIStudioToolbar(lesson: _activeLesson),
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  if (_isLoadingContent)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFF1F5F9)),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(color: Color(0xFF4F46E5)),
                          SizedBox(height: 16),
                          Text(
                            'Loading lesson content...',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    )
                  else if (_activeLesson.contentMarkdown.trim().isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFFEE2E2)),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.wifi_off_rounded, color: Color(0xFFEF4444), size: 48),
                          const SizedBox(height: 16),
                          const Text(
                            'Lesson content could not be loaded.',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Please check your connection and try again.',
                            style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: _fetchLessonContentIfNeeded,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF4F46E5),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            ),
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('Retry Loading Content', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: MarkdownMathViewer(
                        data: _activeLesson.contentMarkdown,
                        customTextColor: const Color(0xFF0F172A),
                      ),
                    ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: isCompleted ? const Color(0xFFECFDF5) : Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: isCompleted ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Icon(
                              isCompleted ? Icons.check_circle_rounded : Icons.workspace_premium_rounded,
                              color: isCompleted ? const Color(0xFF10B981) : const Color(0xFF4F46E5),
                              size: 28,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    isCompleted ? 'Lesson Mastered!' : 'Complete Lesson for +100 XP',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
                                  ),
                                  Text(
                                    isCompleted ? 'You have completed this lesson module.' : 'Marking complete records progress in your profile and awards XP.',
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton.icon(
                            onPressed: _isCompleting ? null : _handleMarkComplete,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isCompleted ? const Color(0xFF059669) : const Color(0xFF4F46E5),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 0,
                            ),
                            icon: _isCompleting
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Icon(Icons.check_circle_outline_rounded),
                            label: Text(
                              isCompleted ? 'Marked Complete (+100 XP)' : 'Mark as Complete (+100 XP)',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: _progress > 0.90 && !isCompleted
          ? FloatingActionButton.extended(
              onPressed: _isCompleting ? null : _handleMarkComplete,
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              elevation: 4,
              icon: const Icon(Icons.check_rounded),
              label: const Text('Mark Complete (+100 XP)', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          : null,
    );
  }
}
