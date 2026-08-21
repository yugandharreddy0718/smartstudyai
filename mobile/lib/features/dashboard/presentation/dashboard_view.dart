import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/dashboard_provider.dart';
import 'widgets/user_header_widget.dart';
import 'widgets/xp_streak_cards.dart';
import 'widgets/continue_learning_card.dart';
import 'widgets/subject_grid.dart';
import 'widgets/recent_activity_list.dart';
import 'widgets/dashboard_skeleton.dart';
import 'widgets/custom_bottom_nav.dart';

class DashboardView extends ConsumerStatefulWidget {
  const DashboardView({super.key});

  @override
  ConsumerState<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends ConsumerState<DashboardView> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);

    return Scaffold(
      body: SafeArea(
        child: dashboardState.when(
          data: (data) {
            return RefreshIndicator(
              onRefresh: () async {
                await ref.read(dashboardProvider.notifier).refresh();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    const UserHeaderWidget(),
                    const SizedBox(height: 24),
                    XpStreakCards(stats: data.stats),
                    const SizedBox(height: 32),
                    const ContinueLearningCard(),
                    const SizedBox(height: 32),
                    SubjectGrid(subjects: data.subjects),
                    const SizedBox(height: 32),
                    RecentActivityList(activities: data.recentActivity),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            );
          },
          loading: () => const DashboardSkeleton(),
          error: (error, stackTrace) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text('Error loading dashboard: $error'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.read(dashboardProvider.notifier).refresh(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: CustomBottomNav(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
