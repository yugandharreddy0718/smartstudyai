import '../domain/dashboard_repository.dart';
import '../domain/dashboard_stats_model.dart';
import '../domain/subject_model.dart';
import '../domain/recent_activity_model.dart';
import '../data/dashboard_remote_data_source.dart';

class DashboardRepositoryImpl implements DashboardRepository {
  final DashboardRemoteDataSource _remoteDataSource;

  DashboardRepositoryImpl(this._remoteDataSource);

  @override
  Future<DashboardStatsModel> getDashboardStats(String uid) {
    return _remoteDataSource.getDashboardStats(uid);
  }

  @override
  Future<List<SubjectModel>> getSubjects(String uid) {
    return _remoteDataSource.getSubjects(uid);
  }

  @override
  Future<List<RecentActivityModel>> getRecentActivity(String uid) {
    return _remoteDataSource.getRecentActivity(uid);
  }

  @override
  Future<void> initializeUserDashboard(String uid) {
    return _remoteDataSource.initializeUserDashboard(uid);
  }
}
