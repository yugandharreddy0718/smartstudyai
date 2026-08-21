import 'dashboard_stats_model.dart';
import 'subject_model.dart';
import 'recent_activity_model.dart';

abstract class DashboardRepository {
  Future<DashboardStatsModel> getDashboardStats(String uid);
  Future<List<SubjectModel>> getSubjects(String uid);
  Future<List<RecentActivityModel>> getRecentActivity(String uid);
  Future<void> initializeUserDashboard(String uid);
}
