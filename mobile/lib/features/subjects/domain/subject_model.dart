class SubjectModel {
  final String id;
  final String classId;
  final String name;
  final String description;
  final String iconUrl;
  final int totalChapters;
  final int order;

  const SubjectModel({
    required this.id,
    required this.classId,
    required this.name,
    required this.description,
    required this.iconUrl,
    required this.totalChapters,
    required this.order,
  });

  factory SubjectModel.fromMap(Map<String, dynamic> map, String id) {
    return SubjectModel(
      id: id,
      classId: map['classId'] as String? ?? '',
      name: map['name'] as String? ?? '',
      description: map['description'] as String? ?? '',
      iconUrl: map['iconUrl'] as String? ?? '',
      totalChapters: map['totalChapters'] as int? ?? 0,
      order: map['order'] as int? ?? 0,
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
    };
  }
}
