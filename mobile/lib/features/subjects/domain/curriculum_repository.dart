import 'subject_model.dart';
import 'chapter_model.dart';
import 'lesson_model.dart';

abstract class CurriculumRepository {
  Future<List<SubjectModel>> getSubjects(String classId);
  Future<List<ChapterModel>> getChapters(String classId, String subjectId);
  Future<List<LessonModel>> getLessons(String classId, String subjectId, String chapterId);
  Future<LessonModel> getLessonDetails(String classId, String subjectId, String chapterId, String lessonId);
}
