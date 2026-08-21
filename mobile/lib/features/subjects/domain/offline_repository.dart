import 'lesson_model.dart';

abstract class OfflineRepository {
  Future<void> initialize();
  Future<void> cacheLesson(LessonModel lesson);
  Future<LessonModel?> getCachedLesson(String lessonId);
  Future<bool> isLessonCached(String lessonId);
  Future<void> removeCachedLesson(String lessonId);
  Future<List<LessonModel>> getAllCachedLessons();
}
