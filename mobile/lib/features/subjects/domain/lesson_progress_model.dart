class LessonProgressModel {
  final String id;
  final String lessonId;
  final bool isCompleted;
  final double scrollPosition;
  final int readingTimeSeconds;
  final DateTime lastRead;

  const LessonProgressModel({
    required this.id,
    required this.lessonId,
    required this.isCompleted,
    required this.scrollPosition,
    required this.readingTimeSeconds,
    required this.lastRead,
  });

  factory LessonProgressModel.fromMap(Map<String, dynamic> map, String id) {
    final isDone = (map['completed'] as bool?) ?? (map['isCompleted'] as bool?) ?? false;
    final lastTime = map['lastAccessedAt'] as int? ?? map['lastRead'] as int? ?? DateTime.now().millisecondsSinceEpoch;

    return LessonProgressModel(
      id: id,
      lessonId: map['lessonId'] as String? ?? id,
      isCompleted: isDone,
      scrollPosition: (map['scrollPosition'] as num?)?.toDouble() ?? 0.0,
      readingTimeSeconds: map['readingTimeSeconds'] as int? ?? 0,
      lastRead: DateTime.fromMillisecondsSinceEpoch(lastTime),
    );
  }

  Map<String, dynamic> toMap() {
    final now = DateTime.now().millisecondsSinceEpoch;
    return {
      'lessonId': lessonId,
      'completed': isCompleted,
      'isCompleted': isCompleted,
      'progressPercentage': isCompleted ? 100 : 0,
      'scrollPosition': scrollPosition,
      'readingTimeSeconds': readingTimeSeconds,
      'lastAccessedAt': lastRead.millisecondsSinceEpoch,
      'lastRead': lastRead.millisecondsSinceEpoch,
      'completedAt': isCompleted ? now : null,
      'updatedAt': now,
    };
  }


  LessonProgressModel copyWith({
    bool? isCompleted,
    double? scrollPosition,
    int? readingTimeSeconds,
    DateTime? lastRead,
  }) {
    return LessonProgressModel(
      id: id,
      lessonId: lessonId,
      isCompleted: isCompleted ?? this.isCompleted,
      scrollPosition: scrollPosition ?? this.scrollPosition,
      readingTimeSeconds: readingTimeSeconds ?? this.readingTimeSeconds,
      lastRead: lastRead ?? this.lastRead,
    );
  }
}
