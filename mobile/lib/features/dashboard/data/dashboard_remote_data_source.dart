import '../domain/dashboard_stats_model.dart';
import '../domain/subject_model.dart';
import '../domain/recent_activity_model.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

abstract class DashboardRemoteDataSource {
  Future<DashboardStatsModel> getDashboardStats(String uid);
  Future<List<SubjectModel>> getSubjects(String uid);
  Future<List<RecentActivityModel>> getRecentActivity(String uid);
  Future<void> initializeUserDashboard(String uid);
}

class FirebaseDashboardDataSource implements DashboardRemoteDataSource {
  final FirebaseFirestore _firestore;

  FirebaseDashboardDataSource(this._firestore);

  @override
  Future<DashboardStatsModel> getDashboardStats(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    if (doc.exists && doc.data() != null) {
      return DashboardStatsModel.fromMap(doc.data()!);
    }
    return DashboardStatsModel.empty();
  }

  @override
  Future<List<SubjectModel>> getSubjects(String uid) async {
    final snapshot = await _firestore
        .collection('users')
        .doc(uid)
        .collection('subjects')
        .get();
        
    return snapshot.docs
        .map((doc) => SubjectModel.fromMap({'id': doc.id, ...doc.data()}))
        .toList();
  }

  @override
  Future<List<RecentActivityModel>> getRecentActivity(String uid) async {
    final snapshot = await _firestore
        .collection('users')
        .doc(uid)
        .collection('recentActivity')
        .orderBy('timestamp', descending: true)
        .limit(5)
        .get();
        
    return snapshot.docs
        .map((doc) => RecentActivityModel.fromMap({'id': doc.id, ...doc.data()}))
        .toList();
  }

  @override
  Future<void> initializeUserDashboard(String uid) async {
    final docRef = _firestore.collection('users').doc(uid);
    final docSnap = await docRef.get();
    
    // Only initialize if it doesn't have XP (meaning it's fresh)
    if (!docSnap.exists || !(docSnap.data()!.containsKey('xp'))) {
      await docRef.set({
        'xp': 0,
        'level': 1,
        'streak': 0,
        'dailyStreak': 0,
        'totalStudyMinutes': 0,
        'completedLessons': 0,
        'completedChapters': 0,
      }, SetOptions(merge: true));

      // Add default subjects
      final subjects = [
        {'name': 'Mathematics', 'iconUrl': 'assets/icons/math.png', 'progressPercentage': 0, 'totalLessons': 20, 'completedLessons': 0},
        {'name': 'Science', 'iconUrl': 'assets/icons/science.png', 'progressPercentage': 0, 'totalLessons': 25, 'completedLessons': 0},
        {'name': 'History', 'iconUrl': 'assets/icons/history.png', 'progressPercentage': 0, 'totalLessons': 15, 'completedLessons': 0},
      ];

      for (var subject in subjects) {
        await docRef.collection('subjects').add(subject);
      }
      
      // Add a welcome activity
      await docRef.collection('recentActivity').add({
        'title': 'Welcome to SmartStudy AI!',
        'subjectId': 'system',
        'subjectName': 'System',
        'timestamp': DateTime.now().millisecondsSinceEpoch,
        'score': 100,
      });
    }
  }
}
