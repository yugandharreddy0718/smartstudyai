class LessonModel {
  final String id;
  final String chapterId;
  final String title;
  final String contentMarkdown;
  final int order;
  final int estimatedMinutes;

  const LessonModel({
    required this.id,
    required this.chapterId,
    required this.title,
    required this.contentMarkdown,
    required this.order,
    required this.estimatedMinutes,
  });

  factory LessonModel.fromMap(Map<String, dynamic> map, String id) {
    return LessonModel(
      id: id,
      chapterId: map['chapterId'] as String? ?? '',
      title: map['title'] as String? ?? '',
      contentMarkdown: map['contentMarkdown'] as String? ?? '',
      order: map['order'] as int? ?? 0,
      estimatedMinutes: map['estimatedMinutes'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'chapterId': chapterId,
      'title': title,
      'contentMarkdown': contentMarkdown,
      'order': order,
      'estimatedMinutes': estimatedMinutes,
    };
  }
}
