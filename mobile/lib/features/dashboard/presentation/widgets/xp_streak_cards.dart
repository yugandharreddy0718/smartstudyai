import 'package:flutter/material.dart';
import '../../domain/dashboard_stats_model.dart';

class XpStreakCards extends StatelessWidget {
  final DashboardStatsModel stats;

  const XpStreakCards({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Row(
        children: [
          Expanded(
            child: _buildStatCard(
              title: 'TOTAL XP',
              value: '${stats.xp}',
              icon: Icons.stars_rounded,
              bg: const Color(0xFFFFFBEB),
              color: const Color(0xFFD97706),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _buildStatCard(
              title: 'LEVEL',
              value: '${stats.level}',
              icon: Icons.military_tech_rounded,
              bg: const Color(0xFFEEF2FF),
              color: const Color(0xFF4F46E5),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _buildStatCard(
              title: 'STREAK',
              value: '${stats.dailyStreak} Days',
              icon: Icons.local_fire_department_rounded,
              bg: const Color(0xFFFFF7ED),
              color: const Color(0xFFEA580C),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color bg,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              maxLines: 1,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
                letterSpacing: -0.2,
              ),
            ),
          ),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              title,
              maxLines: 1,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: Color(0xFF94A3B8),
                letterSpacing: 0.6,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}
