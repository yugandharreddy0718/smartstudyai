import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
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
              context,
              title: 'Total XP',
              value: '${stats.xp}',
              icon: Icons.star_rounded,
              color: Colors.amber,
            ).animate().fade().slideY(begin: 0.2),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildStatCard(
              context,
              title: 'Current Level',
              value: '${stats.level}',
              icon: Icons.military_tech,
              color: Colors.blue,
            ).animate().fade().slideY(begin: 0.2, delay: 100.ms),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: _buildStatCard(
              context,
              title: 'Day Streak',
              value: '${stats.dailyStreak}',
              icon: Icons.local_fire_department,
              color: Colors.orange,
            ).animate().fade().slideY(begin: 0.2, delay: 200.ms),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(BuildContext context,
      {required String title, required String value, required IconData icon, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
