class RecentActivityModel {
  final String id;
  final String title;
  final String subjectId;
  final String subjectName;
  final DateTime timestamp;
  final int score;

  const RecentActivityModel({
    required this.id,
    required this.title,
    required this.subjectId,
    required this.subjectName,
    required this.timestamp,
    required this.score,
  });

  factory RecentActivityModel.fromMap(Map<String, dynamic> map) {
    return RecentActivityModel(
      id: map['id'] as String? ?? '',
      title: map['title'] as String? ?? '',
      subjectId: map['subjectId'] as String? ?? '',
      subjectName: map['subjectName'] as String? ?? '',
      timestamp: map['timestamp'] != null 
          ? DateTime.fromMillisecondsSinceEpoch(map['timestamp'] as int) 
          : DateTime.now(),
      score: map['score'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'subjectId': subjectId,
      'subjectName': subjectName,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'score': score,
    };
  }
}
