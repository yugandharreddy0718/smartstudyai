class SubjectModel {
  final String id;
  final String classId;
  final String name;
  final String description;
  final String iconUrl;
  final int totalChapters;
  final int order;
  final int completedChapters;
  final int completedLessonsCount;

  const SubjectModel({
    required this.id,
    required this.classId,
    required this.name,
    required this.description,
    required this.iconUrl,
    required this.totalChapters,
    required this.order,
    this.completedChapters = 0,
    this.completedLessonsCount = 0,
  });

  int get totalLessons => totalChapters * 3;
  int get completedLessons => completedLessonsCount > 0 ? completedLessonsCount : completedChapters * 3;

  factory SubjectModel.fromMap(Map<String, dynamic> map, String id) {
    return SubjectModel(
      id: id,
      classId: map['classId'] as String? ?? '',
      name: map['name'] as String? ?? '',
      description: map['description'] as String? ?? '',
      iconUrl: (map['iconUrl'] as String? ?? map['icon'] as String? ?? ''),
      totalChapters: (map['totalChapters'] is num) ? (map['totalChapters'] as num).toInt() : 0,
      order: (map['order'] is num) ? (map['order'] as num).toInt() : 0,
      completedChapters: (map['completedChapters'] is num) ? (map['completedChapters'] as num).toInt() : 0,
      completedLessonsCount: (map['completedLessonsCount'] is num) ? (map['completedLessonsCount'] as num).toInt() : 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'classId': classId,
      'name': name,
      'description': description,
      'iconUrl': iconUrl,
      'totalChapters': totalChapters,
      'order': order,
      'completedChapters': completedChapters,
      'completedLessonsCount': completedLessonsCount,
    };
  }

  SubjectModel copyWith({
    int? completedChapters,
    int? completedLessonsCount,
  }) {
    return SubjectModel(
      id: id,
      classId: classId,
      name: name,
      description: description,
      iconUrl: iconUrl,
      totalChapters: totalChapters,
      order: order,
      completedChapters: completedChapters ?? this.completedChapters,
      completedLessonsCount: completedLessonsCount ?? this.completedLessonsCount,
    );
  }
}
