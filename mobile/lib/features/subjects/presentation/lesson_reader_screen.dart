import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import '../domain/lesson_model.dart';
import '../providers/lesson_progress_provider.dart';
import '../providers/offline_provider.dart';
import 'widgets/markdown_math_viewer.dart';

class LessonReaderScreen extends ConsumerStatefulWidget {
  final LessonModel lesson;

  const LessonReaderScreen({super.key, required this.lesson});

  @override
  ConsumerState<LessonReaderScreen> createState() => _LessonReaderScreenState();
}

class _LessonReaderScreenState extends ConsumerState<LessonReaderScreen> {
  final ScrollController _scrollController = ScrollController();
  Timer? _readingTimer;
  int _secondsRead = 0;
  double _progress = 0.0;

  @override
  void initState() {
    super.initState();
    _startTimer();
    _scrollController.addListener(_onScroll);
    
    // Load existing progress
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final progressData = await ref.read(lessonProgressProvider(widget.lesson.id).future);
      if (progressData != null) {
        setState(() {
          _secondsRead = progressData.readingTimeSeconds;
        });
        if (progressData.scrollPosition > 0 && _scrollController.hasClients) {
          _scrollController.jumpTo(progressData.scrollPosition);
        }
      }
    });
  }

  void _startTimer() {
    _readingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsRead++;
      });
      // Auto-save every 10 seconds
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
      widget.lesson.id,
      _scrollController.position.pixels,
      _secondsRead,
    );
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
    final isCachedAsync = ref.watch(isLessonCachedProvider(widget.lesson.id));

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.lesson.title),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4.0),
          child: LinearProgressIndicator(
            value: _progress,
            backgroundColor: Colors.transparent,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        actions: [
          isCachedAsync.when(
            data: (isCached) => IconButton(
              icon: Icon(isCached ? Icons.offline_pin : Icons.download),
              color: isCached ? Colors.green : null,
              onPressed: () {
                ref.read(offlineLessonNotifierProvider.notifier).toggleCache(widget.lesson);
              },
            ),
            loading: () => const SizedBox(width: 48, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
            error: (e, st) => const SizedBox(),
          ),
        ],
      ),
      body: MarkdownMathViewer(
        data: widget.lesson.contentMarkdown,
        scrollController: _scrollController,
      ),
      floatingActionButton: _progress > 0.95
          ? FloatingActionButton.extended(
              onPressed: () async {
                await ref.read(lessonProgressNotifierProvider.notifier).markComplete(widget.lesson.id);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Lesson completed!')),
                  );
                  context.pop();
                }
              },
              label: const Text('Mark Complete'),
              icon: const Icon(Icons.check),
            )
          : null,
    );
  }
}
