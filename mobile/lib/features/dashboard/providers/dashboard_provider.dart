import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../domain/dashboard_repository.dart';
import '../data/dashboard_remote_data_source.dart';
import '../repository/dashboard_repository_impl.dart';
import '../domain/dashboard_stats_model.dart';
import 'dashboard_state.dart';
import 'package:flutter/foundation.dart';
import '../../authentication/providers/auth_state_provider.dart';

final dashboardRemoteDataSourceProvider = Provider<DashboardRemoteDataSource>((ref) {
  return FirebaseDashboardDataSource(ref.read(firestoreProvider));
});

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepositoryImpl(ref.read(dashboardRemoteDataSourceProvider));
});

final dashboardProvider = AsyncNotifierProvider<DashboardNotifier, DashboardState>(
  () => DashboardNotifier(),
);

class DashboardNotifier extends AsyncNotifier<DashboardState> {
  late DashboardRepository _repository;

  @override
  Future<DashboardState> build() async {
    _repository = ref.read(dashboardRepositoryProvider);
    return _fetchData();
  }

  Future<DashboardState> _fetchData() async {
    debugPrint('DEBUG: Dashboard Loaded started');
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      debugPrint('DEBUG: Dashboard fetch failed - no user');
      throw Exception('User not authenticated');
    }

    final uid = user.uid;

    try {
      // Initialize dashboard data if first login, with a timeout
      debugPrint('DEBUG: Initializing User Dashboard in Firestore');
      await _repository.initializeUserDashboard(uid).timeout(const Duration(seconds: 5));
      debugPrint('DEBUG: User Dashboard Initialized');

      final stats = await _repository.getDashboardStats(uid).timeout(const Duration(seconds: 5));
      final subjects = await _repository.getSubjects(uid).timeout(const Duration(seconds: 5));
      final recentActivity = await _repository.getRecentActivity(uid).timeout(const Duration(seconds: 5));

      debugPrint('DEBUG: Dashboard Data Loaded Successfully');
      return DashboardState(
        stats: stats,
        subjects: subjects,
        recentActivity: recentActivity,
      );
    } catch (e) {
      debugPrint('DEBUG: Dashboard fetch failed or timed out: $e. Returning default data.');
      // Handle missing data gracefully instead of waiting forever
      return DashboardState(
        stats: DashboardStatsModel.empty(),
        subjects: [],
        recentActivity: [],
      );
    }
  }

  Future<void> refresh() async {
    debugPrint('DEBUG: Dashboard Refresh Triggered');
    state = const AsyncValue.loading();
    try {
      final data = await _fetchData();
      state = AsyncValue.data(data);
    } catch (e, st) {
      debugPrint('DEBUG: Dashboard Refresh Error: $e');
      state = AsyncValue.error(e, st);
    }
  }
}
