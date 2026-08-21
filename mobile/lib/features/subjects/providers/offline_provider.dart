import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/offline_repository.dart';
import '../domain/lesson_model.dart';
import '../data/hive_offline_data_source.dart';
import 'dart:async';

final offlineRepositoryProvider = Provider<OfflineRepository>((ref) {
  return HiveOfflineDataSource();
});

final isLessonCachedProvider = FutureProvider.family<bool, String>((ref, lessonId) async {
  final repo = ref.read(offlineRepositoryProvider);
  return repo.isLessonCached(lessonId);
});

class OfflineLessonNotifier extends AsyncNotifier<void> {
  late final OfflineRepository _repository;

  @override
  FutureOr<void> build() {
    _repository = ref.read(offlineRepositoryProvider);
  }

  Future<void> toggleCache(LessonModel lesson) async {
    state = const AsyncValue.loading();
    try {
      final isCached = await _repository.isLessonCached(lesson.id);
      if (isCached) {
        await _repository.removeCachedLesson(lesson.id);
      } else {
        await _repository.cacheLesson(lesson);
      }
      ref.invalidate(isLessonCachedProvider(lesson.id));
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final offlineLessonNotifierProvider = AsyncNotifierProvider<OfflineLessonNotifier, void>(
  OfflineLessonNotifier.new,
);
