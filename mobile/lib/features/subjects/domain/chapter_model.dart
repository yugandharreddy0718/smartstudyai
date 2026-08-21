class ChapterModel {
  final String id;
  final String subjectId;
  final String title;
  final String description;
  final int order;
  final int totalLessons;
  final int estimatedMinutes;

  const ChapterModel({
    required this.id,
    required this.subjectId,
    required this.title,
    required this.description,
    required this.order,
    required this.totalLessons,
    required this.estimatedMinutes,
  });

  factory ChapterModel.fromMap(Map<String, dynamic> map, String id) {
    return ChapterModel(
      id: id,
      subjectId: map['subjectId'] as String? ?? '',
      title: map['title'] as String? ?? '',
      description: map['description'] as String? ?? '',
      order: map['order'] as int? ?? 0,
      totalLessons: map['totalLessons'] as int? ?? 0,
      estimatedMinutes: map['estimatedMinutes'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'subjectId': subjectId,
      'title': title,
      'description': description,
      'order': order,
      'totalLessons': totalLessons,
      'estimatedMinutes': estimatedMinutes,
    };
  }
}
