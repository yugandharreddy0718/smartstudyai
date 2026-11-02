class LessonImageModel {
  final String url;
  final String caption;
  final String altText;

  const LessonImageModel({
    required this.url,
    this.caption = '',
    this.altText = '',
  });

  factory LessonImageModel.fromMap(Map<String, dynamic> map) {
    return LessonImageModel(
      url: map['url'] as String? ?? map['src'] as String? ?? '',
      caption: map['caption'] as String? ?? map['title'] as String? ?? '',
      altText: map['altText'] as String? ?? map['alt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'url': url,
      'caption': caption,
      'altText': altText,
    };
  }
}

class LessonModel {
  final String id;
  final String chapterId;
  final String title;
  final String contentMarkdown;
  final int order;
  final int estimatedMinutes;
  final List<LessonImageModel> images;

  const LessonModel({
    required this.id,
    required this.chapterId,
    required this.title,
    required this.contentMarkdown,
    required this.order,
    required this.estimatedMinutes,
    this.images = const [],
  });

  factory LessonModel.fromMap(Map<String, dynamic> map, String id) {
    final rawContent = map['contentMarkdown'] as String? ??
        map['content'] as String? ??
        map['text'] as String? ??
        map['body'] as String? ??
        map['description'] as String? ??
        '';

    final rawImages = (map['images'] as List<dynamic>?)
            ?.map((e) => LessonImageModel.fromMap(e as Map<String, dynamic>))
            .toList() ??
        const [];

    return LessonModel(
      id: id,
      chapterId: map['chapterId'] as String? ?? '',
      title: map['title'] as String? ?? '',
      contentMarkdown: rawContent,
      order: map['order'] as int? ?? 0,
      estimatedMinutes: map['estimatedMinutes'] as int? ?? 15,
      images: rawImages,
    );
  }

  LessonModel copyWith({
    String? id,
    String? chapterId,
    String? title,
    String? contentMarkdown,
    int? order,
    int? estimatedMinutes,
    List<LessonImageModel>? images,
  }) {
    return LessonModel(
      id: id ?? this.id,
      chapterId: chapterId ?? this.chapterId,
      title: title ?? this.title,
      contentMarkdown: contentMarkdown ?? this.contentMarkdown,
      order: order ?? this.order,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      images: images ?? this.images,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'chapterId': chapterId,
      'title': title,
      'contentMarkdown': contentMarkdown,
      'order': order,
      'estimatedMinutes': estimatedMinutes,
      'images': images.map((i) => i.toMap()).toList(),
    };
  }
}
