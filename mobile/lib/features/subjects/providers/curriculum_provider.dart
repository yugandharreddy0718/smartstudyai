import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/curriculum_repository.dart';
import '../domain/subject_model.dart';
import '../domain/chapter_model.dart';
import '../domain/lesson_model.dart';
import '../data/firebase_curriculum_data_source.dart';
import '../../authentication/providers/auth_state_provider.dart';

final curriculumRepositoryProvider = Provider<CurriculumRepository>((ref) {
  return FirebaseCurriculumDataSource(ref.read(firestoreProvider));
});

// A provider that fetches subjects for a specific class
final subjectsProvider = FutureProvider.family<List<SubjectModel>, String>((ref, classId) {
  final repo = ref.read(curriculumRepositoryProvider);
  return repo.getSubjects(classId);
});

// A provider that fetches chapters for a specific subject
final chaptersProvider = FutureProvider.family<List<ChapterModel>, SubjectRequest>((ref, request) {
  final repo = ref.read(curriculumRepositoryProvider);
  return repo.getChapters(request.classId, request.subjectId);
});

// A provider that fetches lessons for a specific chapter
final lessonsProvider = FutureProvider.family<List<LessonModel>, ChapterRequest>((ref, request) {
  final repo = ref.read(curriculumRepositoryProvider);
  return repo.getLessons(request.classId, request.subjectId, request.chapterId);
});

class SubjectRequest {
  final String classId;
  final String subjectId;
  SubjectRequest(this.classId, this.subjectId);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SubjectRequest &&
          runtimeType == other.runtimeType &&
          classId == other.classId &&
          subjectId == other.subjectId;

  @override
  int get hashCode => classId.hashCode ^ subjectId.hashCode;
}

class ChapterRequest {
  final String classId;
  final String subjectId;
  final String chapterId;
  ChapterRequest(this.classId, this.subjectId, this.chapterId);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChapterRequest &&
          runtimeType == other.runtimeType &&
          classId == other.classId &&
          subjectId == other.subjectId &&
          chapterId == other.chapterId;

  @override
  int get hashCode => classId.hashCode ^ subjectId.hashCode ^ chapterId.hashCode;
}
