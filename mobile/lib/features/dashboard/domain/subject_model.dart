class SubjectModel {
  final String id;
  final String name;
  final String iconUrl;
  final int progressPercentage;
  final int totalLessons;
  final int completedLessons;

  const SubjectModel({
    required this.id,
    required this.name,
    required this.iconUrl,
    required this.progressPercentage,
    required this.totalLessons,
    required this.completedLessons,
  });

  factory SubjectModel.fromMap(Map<String, dynamic> map) {
    return SubjectModel(
      id: map['id'] as String? ?? '',
      name: map['name'] as String? ?? '',
      iconUrl: map['iconUrl'] as String? ?? '',
      progressPercentage: map['progressPercentage'] as int? ?? 0,
      totalLessons: map['totalLessons'] as int? ?? 0,
      completedLessons: map['completedLessons'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'iconUrl': iconUrl,
      'progressPercentage': progressPercentage,
      'totalLessons': totalLessons,
      'completedLessons': completedLessons,
    };
  }
}
