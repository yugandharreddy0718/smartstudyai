import 'lesson_progress_model.dart';

abstract class ProgressRepository {
  Future<LessonProgressModel?> getLessonProgress(String uid, String lessonId);
  Future<void> saveLessonProgress(String uid, LessonProgressModel progress);
  Future<void> markLessonComplete(String uid, String lessonId);
  
  Future<List<String>> getBookmarks(String uid);
  Future<void> addBookmark(String uid, String lessonId);
  Future<void> removeBookmark(String uid, String lessonId);
}
