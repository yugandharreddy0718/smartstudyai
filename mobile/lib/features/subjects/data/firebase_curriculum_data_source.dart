import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../domain/curriculum_repository.dart';
import '../domain/subject_model.dart';
import '../domain/chapter_model.dart';
import '../domain/lesson_model.dart';

import 'local_curriculum_data_source.dart';

class FirebaseCurriculumDataSource implements CurriculumRepository {
  final FirebaseFirestore _firestore;
  final LocalCurriculumDataSource _local = LocalCurriculumDataSource();

  FirebaseCurriculumDataSource(this._firestore);

  @override
  Future<List<SubjectModel>> getSubjects(String classId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    final targetClassId = classId.startsWith('class_') ? classId : 'class_$cleanGrade';

    debugPrint('DEBUG: Fetching subjects for targetClassId: $targetClassId (cleanGrade: $cleanGrade)');
    try {
      var snapshot = await _firestore
          .collection('curriculum')
          .doc(targetClassId)
          .collection('subjects')
          .orderBy('order')
          .get()
          .timeout(const Duration(seconds: 3));

      if (snapshot.docs.isEmpty && targetClassId != cleanGrade) {
        snapshot = await _firestore
            .collection('curriculum')
            .doc(cleanGrade)
            .collection('subjects')
            .orderBy('order')
            .get()
            .timeout(const Duration(seconds: 3));
      }

      if (snapshot.docs.isNotEmpty) {
        return snapshot.docs
            .map((doc) => SubjectModel.fromMap(doc.data(), doc.id))
            .toList();
      }
    } catch (e) {
      debugPrint('DEBUG: getSubjects timed out or failed: $e. Using local curriculum fallback.');
    }

    return await _local.getSubjects(cleanGrade);
  }

  @override
  Future<List<ChapterModel>> getChapters(String classId, String subjectId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    debugPrint('DEBUG: Fetching chapters for $subjectId (grade: $cleanGrade)');
    try {
      final snapshot = await _firestore
          .collection('curriculum')
          .doc(classId)
          .collection('subjects')
          .doc(subjectId)
          .collection('chapters')
          .orderBy('order')
          .get()
          .timeout(const Duration(seconds: 3));

      if (snapshot.docs.isNotEmpty) {
        return snapshot.docs
            .map((doc) => ChapterModel.fromMap(doc.data(), doc.id))
            .toList();
      }
    } catch (e) {
      debugPrint('DEBUG: getChapters timed out or failed: $e. Using local curriculum fallback.');
    }

    return await _local.getChapters(cleanGrade, subjectId);
  }

  @override
  Future<List<LessonModel>> getLessons(String classId, String subjectId, String chapterId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    debugPrint('DEBUG: Fetching lessons for $chapterId (grade: $cleanGrade)');
    try {
      final snapshot = await _firestore
          .collection('curriculum')
          .doc(classId)
          .collection('subjects')
          .doc(subjectId)
          .collection('chapters')
          .doc(chapterId)
          .collection('lessons')
          .orderBy('order')
          .get()
          .timeout(const Duration(seconds: 3));

      if (snapshot.docs.isNotEmpty) {
        return snapshot.docs
            .map((doc) => LessonModel.fromMap(doc.data(), doc.id))
            .toList();
      }
    } catch (e) {
      debugPrint('DEBUG: getLessons timed out or failed: $e. Using local curriculum fallback.');
    }

    return await _local.getLessons(cleanGrade, subjectId, chapterId);
  }

  @override
  Future<LessonModel> getLessonDetails(String classId, String subjectId, String chapterId, String lessonId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    try {
      final doc = await _firestore
          .collection('curriculum')
          .doc(classId)
          .collection('subjects')
          .doc(subjectId)
          .collection('chapters')
          .doc(chapterId)
          .collection('lessons')
          .doc(lessonId)
          .get()
          .timeout(const Duration(seconds: 3));

      if (doc.exists && doc.data() != null) {
        return LessonModel.fromMap(doc.data()!, doc.id);
      }
    } catch (e) {
      debugPrint('DEBUG: getLessonDetails timed out or failed: $e. Using local curriculum fallback.');
    }

    return await _local.getLessonDetails(cleanGrade, subjectId, chapterId, lessonId);
  }
}
