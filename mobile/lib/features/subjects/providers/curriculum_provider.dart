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

// A provider that fetches subjects for a specific class and computes real-time completed lesson progress
final subjectsProvider = FutureProvider.family<List<SubjectModel>, String>((ref, classId) async {
  final repo = ref.read(curriculumRepositoryProvider);
  final authState = ref.watch(authStateProvider);
  final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');

  final rawSubjects = await repo.getSubjects(classId);
  final completedLessonIds = authState.user?.completedLessons ?? [];

  return rawSubjects.map((subject) {
    final count = completedLessonIds.where((id) {
      final lowerId = id.toLowerCase();
      final subId = subject.id.toLowerCase();
      final subName = subject.name.toLowerCase();

      final matchesSub = lowerId.contains(subId) || 
                         lowerId.contains(subName) ||
                         (subId.contains('math') && lowerId.contains('math')) ||
                         (subId.contains('phys') && lowerId.contains('phys')) ||
                         (subId.contains('chem') && lowerId.contains('chem')) ||
                         (subId.contains('bio') && lowerId.contains('bio')) ||
                         (subId.contains('hist') && lowerId.contains('hist')) ||
                         (subId.contains('geog') && lowerId.contains('geog'));
      
      final matchesGrade = cleanGrade.isEmpty || lowerId.contains('g$cleanGrade') || lowerId.contains('class_$cleanGrade') || lowerId.contains('grade_$cleanGrade') || !lowerId.contains('g');
      
      return matchesSub && matchesGrade;
    }).length;

    return subject.copyWith(completedLessonsCount: count);
  }).toList();
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
