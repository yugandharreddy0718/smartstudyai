import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/dashboard_provider.dart';
import 'widgets/user_header_widget.dart';
import 'widgets/xp_streak_cards.dart';
import 'widgets/continue_learning_card.dart';
import 'widgets/subject_grid.dart';
import 'widgets/recent_activity_list.dart';
import 'widgets/dashboard_skeleton.dart';
import 'widgets/custom_bottom_nav.dart';
import '../../authentication/providers/auth_state_provider.dart';
import '../../subjects/providers/curriculum_provider.dart';
import '../../subjects/domain/subject_model.dart';

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
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: dashboardState.when(
          data: (data) {
            return RefreshIndicator(
              color: const Color(0xFF4F46E5),
              onRefresh: () async {
                await ref.read(dashboardProvider.notifier).refresh();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    const UserHeaderWidget(),

                    // SuperAdmin / Admin Portal Interactive Banner
                    Consumer(
                      builder: (context, ref, _) {
                        final authState = ref.watch(authStateProvider);
                        if (authState.user?.isAdmin != true) return const SizedBox.shrink();
                        final isSuperAdmin = authState.user?.isSuperAdmin == true;

                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                          child: InkWell(
                            onTap: () => context.push('/admin'),
                            borderRadius: BorderRadius.circular(22),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF4338CA), Color(0xFF6366F1)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(22),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                                    blurRadius: 14,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 42,
                                    height: 42,
                                    padding: const EdgeInsets.all(9),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.2),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.admin_panel_settings_rounded,
                                      color: Colors.white,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Row(
                                          children: [
                                            Flexible(
                                              child: Text(
                                                isSuperAdmin ? 'SuperAdmin Portal' : 'Admin Portal',
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.w800,
                                                  fontSize: 15,
                                                  letterSpacing: -0.2,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withValues(alpha: 0.25),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: const Text(
                                                'LIVE SYNC',
                                                style: TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w800,
                                                  letterSpacing: 0.5,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          'Curriculum control & student management',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            color: Colors.white.withValues(alpha: 0.9),
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      color: Colors.white,
                                      size: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 12),
                    XpStreakCards(stats: data.stats),
                    const SizedBox(height: 20),
                    const ContinueLearningCard(),
                    const SizedBox(height: 20),

                    // Subjects Grid
                    Consumer(
                      builder: (context, ref, _) {
                        final authState = ref.watch(authStateProvider);
                        final userGrade = authState.user?.grade ?? '8';
                        final activeClass = 'class_$userGrade';
                        final subjectsAsync = ref.watch(subjectsProvider(activeClass));
                        final List<SubjectModel> activeSubjects = subjectsAsync.value ?? [];
                        return SubjectGrid(subjects: activeSubjects);
                      },
                    ),

                    const SizedBox(height: 20),

                    // Multimodal AI OCR & Tutor Banner Card
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEEF2FF),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFFC7D2FE)),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF4F46E5).withValues(alpha: 0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFF4F46E5),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Icon(
                                Icons.auto_awesome_rounded,
                                color: Colors.white,
                                size: 26,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Text(
                                    'Multimodal AI OCR & Tutor',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 15,
                                      color: Color(0xFF0F172A),
                                    ),
                                  ),
                                  SizedBox(height: 3),
                                  Text(
                                    'Upload PDFs, notes, or ask 24/7 AI tutor questions',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF64748B),
                                      height: 1.3,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: () => context.push('/upload'),
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFC7D2FE)),
                                ),
                                child: const Icon(
                                  Icons.arrow_forward_rounded,
                                  color: Color(0xFF4F46E5),
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),
                    RecentActivityList(activities: data.recentActivity),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            );
          },
          loading: () => const DashboardSkeleton(),
          error: (error, stackTrace) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: Color(0xFFF43F5E), size: 48),
                  const SizedBox(height: 16),
                  Text(
                    'Error loading dashboard:\n$error',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => ref.read(dashboardProvider.notifier).refresh(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Retry'),
                  ),
                ],
              ),
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
          if (index == 1) {
            context.push('/subjects');
          } else if (index == 2) {
            context.push('/upload');
          } else if (index == 3) {
            context.push('/ai-tutor');
          } else if (index == 4) {
            context.push('/profile');
          }
        },
      ),
    );
  }
}
