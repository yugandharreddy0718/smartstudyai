import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../domain/curriculum_repository.dart';
import '../domain/subject_model.dart';
import '../domain/chapter_model.dart';
import '../domain/lesson_model.dart';
import '../domain/book_model.dart';
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
    
    // 1. Fetch baseline local subjects
    final localSubjects = await _local.getSubjects(cleanGrade);
    final subjectMap = <String, SubjectModel>{};
    for (final s in localSubjects) {
      subjectMap[s.id] = s;
    }

    // 2. Fetch live Firestore subjects
    try {
      var snapshot = await _firestore
          .collection('curriculum')
          .doc(targetClassId)
          .collection('subjects')
          .orderBy('order')
          .get()
          .timeout(const Duration(seconds: 4));

      if (snapshot.docs.isEmpty && targetClassId != cleanGrade) {
        snapshot = await _firestore
            .collection('curriculum')
            .doc(cleanGrade)
            .collection('subjects')
            .orderBy('order')
            .get()
            .timeout(const Duration(seconds: 4));
      }

      if (snapshot.docs.isNotEmpty) {
        for (final doc in snapshot.docs) {
          final firestoreSubject = SubjectModel.fromMap(doc.data(), doc.id);
          subjectMap[firestoreSubject.id] = firestoreSubject;
        }
      }
    } catch (e) {
      debugPrint('DEBUG: getSubjects Firestore query failed: $e. Using local curriculum baseline.');
    }

    final merged = subjectMap.values.toList();
    merged.sort((a, b) => a.order.compareTo(b.order));
    return merged;
  }

  @override
  Future<List<ChapterModel>> getChapters(String classId, String subjectId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    final targetClassId = classId.startsWith('class_') ? classId : 'class_$cleanGrade';

    debugPrint('DEBUG: Fetching chapters for $subjectId (targetClassId: $targetClassId, grade: $cleanGrade)');

    // 1. Fetch baseline local chapters
    final localChapters = await _local.getChapters(cleanGrade, subjectId);
    final chapterMap = <String, ChapterModel>{};
    for (final ch in localChapters) {
      chapterMap[ch.id] = ch;
    }

    // 2. Fetch live Firestore chapters
    try {
      var snapshot = await _firestore
          .collection('curriculum')
          .doc(targetClassId)
          .collection('subjects')
          .doc(subjectId)
          .collection('chapters')
          .orderBy('order')
          .get()
          .timeout(const Duration(seconds: 4));

      if (snapshot.docs.isEmpty && targetClassId != cleanGrade) {
        snapshot = await _firestore
            .collection('curriculum')
            .doc(cleanGrade)
            .collection('subjects')
            .doc(subjectId)
            .collection('chapters')
            .orderBy('order')
            .get()
            .timeout(const Duration(seconds: 4));
      }

      if (snapshot.docs.isNotEmpty) {
        for (final doc in snapshot.docs) {
          final firestoreChapter = ChapterModel.fromMap(doc.data(), doc.id);
          chapterMap[firestoreChapter.id] = firestoreChapter;
        }
      }
    } catch (e) {
      debugPrint('DEBUG: getChapters Firestore query failed: $e. Using local curriculum baseline.');
    }

    final merged = chapterMap.values.toList();
    merged.sort((a, b) => a.order.compareTo(b.order));
    return merged;
  }

  @override
  Future<List<LessonModel>> getLessons(String classId, String subjectId, String chapterId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    final targetClassId = classId.startsWith('class_') ? classId : 'class_$cleanGrade';

    debugPrint('DEBUG: Fetching lessons for chapterId: $chapterId (classId: $targetClassId, subjectId: $subjectId)');

    // 1. Fetch baseline local lessons
    final localLessons = await _local.getLessons(cleanGrade, subjectId, chapterId);
    final lessonMap = <String, LessonModel>{};
    for (final l in localLessons) {
      lessonMap[l.id] = l;
    }

    // 2. Check nested Firestore path: curriculum/{targetClassId}/subjects/{subjectId}/chapters/{chapterId}/lessons
    try {
      final snapshot = await _firestore
          .collection('curriculum')
          .doc(targetClassId)
          .collection('subjects')
          .doc(subjectId)
          .collection('chapters')
          .doc(chapterId)
          .collection('lessons')
          .orderBy('order')
          .get()
          .timeout(const Duration(seconds: 4));

      if (snapshot.docs.isNotEmpty) {
        for (final doc in snapshot.docs) {
          final firestoreLesson = LessonModel.fromMap(doc.data(), doc.id);
          lessonMap[firestoreLesson.id] = firestoreLesson;
        }
      }
    } catch (e) {
      debugPrint('DEBUG: getLessons nested collection query notice: $e');
    }

    // 3. Also check top-level 'lessons' collection with where('chapterId', isEqualTo: chapterId)
    try {
      final snapshot = await _firestore
          .collection('lessons')
          .where('chapterId', isEqualTo: chapterId)
          .get()
          .timeout(const Duration(seconds: 4));

      if (snapshot.docs.isNotEmpty) {
        for (final doc in snapshot.docs) {
          final firestoreLesson = LessonModel.fromMap(doc.data(), doc.id);
          lessonMap[firestoreLesson.id] = firestoreLesson;
        }
      }
    } catch (e) {
      debugPrint('DEBUG: getLessons top-level query notice: $e');
    }

    final merged = lessonMap.values.toList();
    merged.sort((a, b) => a.order.compareTo(b.order));
    return merged;
  }

  @override
  Future<LessonModel> getLessonDetails(String classId, String subjectId, String chapterId, String lessonId) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    final targetClassId = classId.startsWith('class_') ? classId : 'class_$cleanGrade';

    debugPrint('DEBUG: getLessonDetails for classId: $targetClassId, subjectId: $subjectId, chapterId: $chapterId, lessonId: $lessonId');

    // 1. Check top-level 'lessons' collection first (fastest and updated directly by Web Admin)
    try {
      final doc = await _firestore
          .collection('lessons')
          .doc(lessonId)
          .get()
          .timeout(const Duration(seconds: 4));

      if (doc.exists && doc.data() != null) {
        final model = LessonModel.fromMap(doc.data()!, doc.id);
        if (model.contentMarkdown.trim().isNotEmpty) {
          debugPrint('DEBUG: Found live lesson content in top-level lessons collection: $lessonId');
          return model;
        }
      }
    } catch (e) {
      debugPrint('DEBUG: getLessonDetails top-level lessons query notice: $e');
    }

    // 2. Check nested path: curriculum/{targetClassId}/subjects/{subjectId}/chapters/{chapterId}/lessons/{lessonId}
    try {
      final doc = await _firestore
          .collection('curriculum')
          .doc(targetClassId)
          .collection('subjects')
          .doc(subjectId)
          .collection('chapters')
          .doc(chapterId)
          .collection('lessons')
          .doc(lessonId)
          .get()
          .timeout(const Duration(seconds: 4));

      if (doc.exists && doc.data() != null) {
        final model = LessonModel.fromMap(doc.data()!, doc.id);
        if (model.contentMarkdown.trim().isNotEmpty) {
          debugPrint('DEBUG: Found live lesson content in nested curriculum path: $lessonId');
          return model;
        }
      }
    } catch (e) {
      debugPrint('DEBUG: getLessonDetails nested query notice: $e');
    }

    // 3. Fallback to local lesson details
    return await _local.getLessonDetails(cleanGrade, subjectId, chapterId, lessonId);
  }

  @override
  Future<List<BookModel>> getBooks(String classId, {String? subjectId}) async {
    final cleanGrade = classId.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    final targetClassId = classId.startsWith('class_') ? classId : 'class_$cleanGrade';

    debugPrint('DEBUG: Fetching books for classId: $targetClassId, subjectId: $subjectId');
    try {
      final colRef = _firestore.collection('curriculum').doc(targetClassId).collection('books');
      Query<Map<String, dynamic>> q = colRef.orderBy('createdAt', descending: true);
      if (subjectId != null && subjectId.isNotEmpty) {
        q = colRef.where('subjectId', isEqualTo: subjectId).orderBy('createdAt', descending: true);
      }
      final snapshot = await q.get().timeout(const Duration(seconds: 4));
      if (snapshot.docs.isNotEmpty) {
        return snapshot.docs.map((doc) => BookModel.fromMap(doc.data(), doc.id)).toList();
      }
    } catch (e) {
      debugPrint('DEBUG: getBooks Firestore query failed: $e');
    }
    return [];
  }
}
