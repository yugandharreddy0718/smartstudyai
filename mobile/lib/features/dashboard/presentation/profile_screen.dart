import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';
import '../../authentication/providers/auth_state_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _updatingGrade = false;

  Future<void> _changeGrade(String newGrade) async {
    final authState = ref.read(authStateProvider);
    final user = authState.user;
    if (user == null || _updatingGrade) return;

    setState(() {
      _updatingGrade = true;
    });

    try {
      final uid = user.id;
      final firestore = ref.read(firestoreProvider);
      
      // Update Firestore
      await firestore.collection('users').doc(uid).set({
        'studentClass': newGrade,
        'grade': newGrade,
        'updatedAt': DateTime.now().millisecondsSinceEpoch,
      }, SetOptions(merge: true));

      // Update auth repository & state
      await ref.read(authRepositoryProvider).updateProfile(
        uid: uid,
        studentClass: newGrade,
        grade: newGrade,
      );

      final updatedUser = user.copyWith(studentClass: newGrade);
      ref.read(authStateProvider.notifier).setAuthenticated(updatedUser);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Grade updated to Grade $newGrade'),
            backgroundColor: const Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating grade: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _updatingGrade = false;
        });
      }
    }
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to log out of SmartStudy AI?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF43F5E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Logout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(authRepositoryProvider).logout();
      ref.read(authStateProvider.notifier).setUnauthenticated();
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;

    final name = user?.displayName ?? 'Student';
    final email = user?.email ?? 'No email registered';
    final photoUrl = user?.photoURL;
    final currentGrade = user?.grade ?? '8';
    final xp = user?.xp ?? 0;
    final level = user?.level ?? 1;
    final streak = user?.streak ?? 0;
    final completedCount = user?.completedLessons.length ?? 0;
    final shortUid = user != null && user.id.isNotEmpty
        ? (user.id.length >= 8 ? user.id.substring(0, 8).toUpperCase() : user.id.toUpperCase())
        : 'N/A';
    final tier = xp >= 500 ? 'Master' : (xp >= 200 ? 'Scholar' : 'Learner');

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Profile',
          style: TextStyle(
            color: Color(0xFF0F172A),
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.logout_rounded, color: Color(0xFFF43F5E), size: 20),
            ),
            onPressed: _logout,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Profile Header Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: const Color(0xFFF1F5F9)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Stack(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF4F46E5).withValues(alpha: 0.15),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                        child: photoUrl != null && photoUrl.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(21),
                                child: Image.network(photoUrl, fit: BoxFit.cover),
                              )
                            : const Icon(Icons.person_rounded, color: Color(0xFF4F46E5), size: 40),
                      ),
                      Positioned(
                        bottom: -2,
                        right: -2,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: Text(
                            'Lvl $level',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          email,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF94A3B8),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 6,
                          children: [
                            _buildTag('Grade $currentGrade', const Color(0xFFEEF2FF), const Color(0xFF4F46E5)),
                            _buildTag(
                              user?.isSuperAdmin == true ? 'SuperAdmin' : (user?.isAdmin == true ? 'Admin' : 'Scholar'),
                              user?.isAdmin == true ? const Color(0xFFEEF2FF) : const Color(0xFFECFDF5),
                              user?.isAdmin == true ? const Color(0xFF4F46E5) : const Color(0xFF10B981),
                            ),
                            _buildTag('#$shortUid', const Color(0xFF0F172A), Colors.white),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Stats Grid
            Row(
              children: [
                Expanded(child: _buildStatBox('Experience', '$xp XP', Icons.military_tech_rounded, const Color(0xFFFFFBEB), const Color(0xFFD97706))),
                const SizedBox(width: 12),
                Expanded(child: _buildStatBox('Streak', '$streak Days', Icons.local_fire_department_rounded, const Color(0xFFFFF7ED), const Color(0xFFEA580C))),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildStatBox('Lessons', '$completedCount Done', Icons.check_circle_outline_rounded, const Color(0xFFEEF2FF), const Color(0xFF4F46E5))),
                const SizedBox(width: 12),
                Expanded(child: _buildStatBox('Tier', tier, Icons.emoji_events_rounded, const Color(0xFFECFDF5), const Color(0xFF059669))),
              ],
            ),
            const SizedBox(height: 28),

            // Active Grade Level Selector
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.school_rounded, color: Color(0xFF4F46E5), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'ACTIVE GRADE LEVEL',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF64748B),
                          letterSpacing: 1.1,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: ['6', '7', '8', '9', '10'].map((g) {
                      final isSelected = currentGrade == g;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4.0),
                          child: InkWell(
                            onTap: () => _changeGrade(g),
                            borderRadius: BorderRadius.circular(16),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
                                ),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                                          blurRadius: 8,
                                          offset: const Offset(0, 4),
                                        )
                                      ]
                                    : null,
                              ),
                              child: Center(
                                child: Text(
                                  'G$g',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? Colors.white : const Color(0xFF475569),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Changing your grade level automatically calibrates curriculum, subjects, chapters, and study tasks.',
                    style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Badges & Achievements
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Badges & Achievements',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 16),
                  GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    children: [
                      _BadgeTile(icon: '🔥', label: '7 Day Streak', unlocked: streak >= 7),
                      _BadgeTile(icon: '🧠', label: 'Math Pro', unlocked: user?.completedLessons.any((id) => id.contains('maths')) ?? false),
                      _BadgeTile(icon: '📚', label: 'Reading Owl', unlocked: completedCount >= 5),
                      _BadgeTile(icon: '🎨', label: 'Creative', unlocked: xp >= 200),
                      _BadgeTile(icon: '⚡', label: 'Fast Learner', unlocked: completedCount >= 10),
                      _BadgeTile(icon: '🌟', label: 'Overachiever', unlocked: xp >= 500),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Admin Console Section (for authorized administrators only)
            if (user?.isAdmin == true) ...[
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4F46E5), Color(0xFF4338CA)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF4F46E5).withValues(alpha: 0.3),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 24),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user!.isSuperAdmin ? 'SuperAdmin Console' : 'Admin Console',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Manage curriculum, users & system',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.white.withValues(alpha: 0.85),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => context.push('/admin'),
                        icon: const Icon(Icons.dashboard_rounded, size: 18),
                        label: const Text('Open Admin Panel', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF4338CA),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
            ],

            // Settings Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Settings',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 12),
                  _buildSettingRow(Icons.settings_outlined, 'General Settings'),
                  _buildSettingRow(Icons.palette_outlined, 'Appearance & Theme'),
                  _buildSettingRow(Icons.security_outlined, 'Privacy & Security'),
                  const Divider(height: 32, color: Color(0xFFF1F5F9)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('App Version 1.0.0', style: TextStyle(fontSize: 11, color: Color(0xFFCBD5E1))),
                      Text('SmartStudy AI 2026', style: TextStyle(fontSize: 11, color: Color(0xFFCBD5E1))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildTag(String label, Color bg, Color text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: text,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStatBox(String label, String value, IconData icon, Color bg, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingRow(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF94A3B8), size: 20),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: Color(0xFFCBD5E1), size: 20),
        ],
      ),
    );
  }
}

class _BadgeTile extends StatelessWidget {
  final String icon;
  final String label;
  final bool unlocked;

  const _BadgeTile({required this.icon, required this.label, required this.unlocked});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: unlocked ? const Color(0xFFF8FAFC) : const Color(0xFFF1F5F9).withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: unlocked ? const Color(0xFFE2E8F0) : Colors.transparent),
          ),
          child: Center(
            child: Text(
              icon,
              style: TextStyle(
                fontSize: 26,
                color: unlocked ? Colors.black : Colors.grey,
              ),
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: unlocked ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
          ),
        ),
      ],
    );
  }
}
