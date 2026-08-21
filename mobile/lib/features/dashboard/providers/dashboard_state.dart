import '../domain/dashboard_stats_model.dart';
import '../domain/subject_model.dart';
import '../domain/recent_activity_model.dart';

class DashboardState {
  final DashboardStatsModel stats;
  final List<SubjectModel> subjects;
  final List<RecentActivityModel> recentActivity;

  const DashboardState({
    required this.stats,
    required this.subjects,
    required this.recentActivity,
  });

  DashboardState copyWith({
    DashboardStatsModel? stats,
    List<SubjectModel>? subjects,
    List<RecentActivityModel>? recentActivity,
  }) {
    return DashboardState(
      stats: stats ?? this.stats,
      subjects: subjects ?? this.subjects,
      recentActivity: recentActivity ?? this.recentActivity,
    );
  }
}
