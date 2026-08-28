import 'package:cloud_firestore/cloud_firestore.dart';
import '../domain/progress_repository.dart';
import '../domain/lesson_progress_model.dart';

class FirebaseProgressDataSource implements ProgressRepository {
  final FirebaseFirestore _firestore;

  FirebaseProgressDataSource(this._firestore);

  @override
  Future<LessonProgressModel?> getLessonProgress(String uid, String lessonId) async {
    final doc = await _firestore
        .collection('users')
        .doc(uid)
        .collection('lessonProgress')
        .doc(lessonId)
        .get();

    if (doc.exists && doc.data() != null) {
      return LessonProgressModel.fromMap(doc.data()!, doc.id);
    }
    return null;
  }

  @override
  Future<void> saveLessonProgress(String uid, LessonProgressModel progress) async {
    await _firestore
        .collection('users')
        .doc(uid)
        .collection('lessonProgress')
        .doc(progress.lessonId)
        .set(progress.toMap(), SetOptions(merge: true));
  }

  @override
  @override
  Future<void> markLessonComplete(String uid, String lessonId) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final progressRef = _firestore
        .collection('users')
        .doc(uid)
        .collection('lessonProgress')
        .doc(lessonId);

    await progressRef.set({
      'lessonId': lessonId,
      'completed': true,
      'isCompleted': true,
      'progressPercentage': 100,
      'lastAccessedAt': now,
      'lastRead': now,
      'completedAt': now,
      'updatedAt': now,
    }, SetOptions(merge: true));

    // Also update parent user profile stats and completedLessons list
    final userRef = _firestore.collection('users').doc(uid);
    final userSnap = await userRef.get();
    if (userSnap.exists && userSnap.data() != null) {
      final data = userSnap.data()!;
      final List<dynamic> currentCompleted = List.from(data['completedLessons'] ?? []);
      if (!currentCompleted.contains(lessonId)) {
        currentCompleted.add(lessonId);
      }

      final int currentXp = (data['xp'] as int? ?? data['stats']?['xp'] as int? ?? 0);
      final int newXp = currentXp + 100;
      final int newLevel = (newXp ~/ 500) + 1;
      final int currentStreak = (data['streak'] as int? ?? data['dailyStreak'] as int? ?? 0);
      final int newStreak = currentStreak == 0 ? 1 : currentStreak;

      await userRef.set({
        'completedLessons': currentCompleted,
        'xp': newXp,
        'level': newLevel,
        'streak': newStreak,
        'dailyStreak': newStreak,
        'updatedAt': now,
      }, SetOptions(merge: true));
    }
  }


  @override
  Future<List<String>> getBookmarks(String uid) async {
    final snapshot = await _firestore
        .collection('users')
        .doc(uid)
        .collection('bookmarks')
        .get();

    return snapshot.docs.map((doc) => doc.id).toList();
  }

  @override
  Future<void> addBookmark(String uid, String lessonId) async {
    await _firestore
        .collection('users')
        .doc(uid)
        .collection('bookmarks')
        .doc(lessonId)
        .set({'timestamp': DateTime.now().millisecondsSinceEpoch});
  }

  @override
  Future<void> removeBookmark(String uid, String lessonId) async {
    await _firestore
        .collection('users')
        .doc(uid)
        .collection('bookmarks')
        .doc(lessonId)
        .delete();
  }
}
