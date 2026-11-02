class BookModel {
  final String id;
  final String title;
  final String classId;
  final String subjectId;
  final String description;
  final String? coverImageUrl;
  final String pdfUrl;
  final String? storagePath;
  final int fileSizeBytes;
  final String fileName;
  final String status;

  BookModel({
    required this.id,
    required this.title,
    required this.classId,
    required this.subjectId,
    this.description = '',
    this.coverImageUrl,
    required this.pdfUrl,
    this.storagePath,
    this.fileSizeBytes = 0,
    this.fileName = '',
    this.status = 'published',
  });

  factory BookModel.fromMap(Map<String, dynamic> map, String id) {
    return BookModel(
      id: id,
      title: map['title']?.toString() ?? '',
      classId: map['classId']?.toString() ?? '',
      subjectId: map['subjectId']?.toString() ?? '',
      description: map['description']?.toString() ?? '',
      coverImageUrl: map['coverImageUrl']?.toString(),
      pdfUrl: map['pdfUrl']?.toString() ?? '',
      storagePath: map['storagePath']?.toString(),
      fileSizeBytes: (map['fileSizeBytes'] is num) ? (map['fileSizeBytes'] as num).toInt() : 0,
      fileName: map['fileName']?.toString() ?? '',
      status: map['status']?.toString() ?? 'published',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'classId': classId,
      'subjectId': subjectId,
      'description': description,
      'coverImageUrl': coverImageUrl,
      'pdfUrl': pdfUrl,
      'storagePath': storagePath,
      'fileSizeBytes': fileSizeBytes,
      'fileName': fileName,
      'status': status,
    };
  }
}

