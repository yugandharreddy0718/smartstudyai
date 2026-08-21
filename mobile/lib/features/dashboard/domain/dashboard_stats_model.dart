class DashboardStatsModel {
  final int xp;
  final int level;
  final int dailyStreak;
  final int totalStudyMinutes;
  final int completedLessons;
  final int completedChapters;

  const DashboardStatsModel({
    required this.xp,
    required this.level,
    required this.dailyStreak,
    required this.totalStudyMinutes,
    required this.completedLessons,
    required this.completedChapters,
  });

  factory DashboardStatsModel.empty() {
    return const DashboardStatsModel(
      xp: 0,
      level: 1,
      dailyStreak: 0,
      totalStudyMinutes: 0,
      completedLessons: 0,
      completedChapters: 0,
    );
  }

  factory DashboardStatsModel.fromMap(Map<String, dynamic> map) {
    return DashboardStatsModel(
      xp: map['xp'] as int? ?? 0,
      level: map['level'] as int? ?? 1,
      dailyStreak: map['dailyStreak'] as int? ?? 0,
      totalStudyMinutes: map['totalStudyMinutes'] as int? ?? 0,
      completedLessons: map['completedLessons'] as int? ?? 0,
      completedChapters: map['completedChapters'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'xp': xp,
      'level': level,
      'dailyStreak': dailyStreak,
      'totalStudyMinutes': totalStudyMinutes,
      'completedLessons': completedLessons,
      'completedChapters': completedChapters,
    };
  }

  DashboardStatsModel copyWith({
    int? xp,
    int? level,
    int? dailyStreak,
    int? totalStudyMinutes,
    int? completedLessons,
    int? completedChapters,
  }) {
    return DashboardStatsModel(
      xp: xp ?? this.xp,
      level: level ?? this.level,
      dailyStreak: dailyStreak ?? this.dailyStreak,
      totalStudyMinutes: totalStudyMinutes ?? this.totalStudyMinutes,
      completedLessons: completedLessons ?? this.completedLessons,
      completedChapters: completedChapters ?? this.completedChapters,
    );
  }
}
