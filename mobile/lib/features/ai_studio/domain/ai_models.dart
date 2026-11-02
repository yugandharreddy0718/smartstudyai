class ImportantQuestionModel {
  final String markCategory; // "1 MARK", "2 MARKS", "3 MARKS", "5 MARKS"
  final String question;
  final String answer;
  final List<String> markingPoints;

  const ImportantQuestionModel({
    required this.markCategory,
    required this.question,
    required this.answer,
    required this.markingPoints,
  });

  factory ImportantQuestionModel.fromMap(Map<String, dynamic> map) {
    String category = '2 MARKS';
    if (map['markCategory'] != null && map['markCategory'].toString().trim().isNotEmpty) {
      category = map['markCategory'].toString();
    } else if (map['marks'] != null) {
      final m = map['marks'].toString();
      category = '$m MARK${m == '1' ? '' : 'S'}';
    } else if (map['type'] != null) {
      final t = map['type'].toString().toLowerCase();
      if (t.contains('very_short') || t.contains('1')) {
        category = '1 MARK';
      } else if (t.contains('short') || t.contains('2')) {
        category = '2 MARKS';
      } else if (t.contains('medium') || t.contains('3')) {
        category = '3 MARKS';
      } else if (t.contains('long') || t.contains('5')) {
        category = '5 MARKS';
      }
    }

    final rawPoints = map['keyPoints'] ?? map['markingPoints'];
    final pointsList = (rawPoints as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];

    return ImportantQuestionModel(
      markCategory: category,
      question: map['question'] as String? ?? map['q'] as String? ?? '',
      answer: map['answer'] as String? ?? map['ans'] as String? ?? '',
      markingPoints: pointsList,
    );
  }
}

class MCQModel {
  final String id;
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;

  const MCQModel({
    required this.id,
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
  });

  factory MCQModel.fromMap(Map<String, dynamic> map, int defaultIdx) {
    final rawOptions = (map['options'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];
    int idx = 0;

    if (map['correctIndex'] is int) {
      idx = map['correctIndex'] as int;
    } else if (map['answerIndex'] is int) {
      idx = map['answerIndex'] as int;
    } else if (map['correctAnswer'] != null && rawOptions.isNotEmpty) {
      final ca = map['correctAnswer'].toString().trim().toLowerCase();
      final matched = rawOptions.indexWhere((opt) {
        final o = opt.trim().toLowerCase();
        return o == ca || o.contains(ca) || ca.contains(o);
      });
      if (matched != -1) idx = matched;
    }

    if (idx < 0 || idx >= rawOptions.length) {
      idx = 0;
    }

    return MCQModel(
      id: map['id']?.toString() ?? 'q_$defaultIdx',
      question: map['question'] as String? ?? '',
      options: rawOptions,
      correctIndex: idx,
      explanation: map['explanation'] as String? ?? '',
    );
  }
}

class ChatMessageModel {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;

  const ChatMessageModel({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
  });

  String get role => isUser ? 'user' : 'assistant';
  String get messageId => id;
  String get content => text;

  Map<String, dynamic> toMap() {
    return {
      'messageId': id,
      'role': role,
      'content': text,
      'timestamp': timestamp.millisecondsSinceEpoch,
    };
  }

  factory ChatMessageModel.fromMap(Map<String, dynamic> map) {
    final rawId = map['messageId'] ?? map['id'] ?? DateTime.now().millisecondsSinceEpoch.toString();
    final role = (map['role']?.toString().toLowerCase()) ?? (map['isUser'] == true ? 'user' : 'assistant');
    final isUserRole = role == 'user' || map['isUser'] == true;
    final contentText = map['content'] ?? map['text'] ?? '';
    
    DateTime dt;
    if (map['timestamp'] is int) {
      dt = DateTime.fromMillisecondsSinceEpoch(map['timestamp'] as int);
    } else if (map['timestamp'] is DateTime) {
      dt = map['timestamp'] as DateTime;
    } else {
      dt = DateTime.now();
    }

    return ChatMessageModel(
      id: rawId.toString(),
      text: contentText.toString(),
      isUser: isUserRole,
      timestamp: dt,
    );
  }
}

class ChatSessionModel {
  final String chatId;
  final String userId;
  final String title;
  final int createdAt;
  final int updatedAt;
  final int expiresAt;
  final List<ChatMessageModel> messages;

  const ChatSessionModel({
    required this.chatId,
    required this.userId,
    required this.title,
    required this.createdAt,
    required this.updatedAt,
    required this.expiresAt,
    required this.messages,
  });

  Map<String, dynamic> toMap() {
    return {
      'chatId': chatId,
      'userId': userId,
      'title': title,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'expiresAt': expiresAt,
      'messages': messages.map((m) => m.toMap()).toList(),
    };
  }

  factory ChatSessionModel.fromMap(Map<String, dynamic> map, String docId) {
    final rawMessages = (map['messages'] as List<dynamic>?) ?? [];
    return ChatSessionModel(
      chatId: map['chatId']?.toString() ?? docId,
      userId: map['userId']?.toString() ?? '',
      title: map['title']?.toString() ?? 'Study Discussion',
      createdAt: map['createdAt'] is int ? map['createdAt'] as int : DateTime.now().millisecondsSinceEpoch,
      updatedAt: map['updatedAt'] is int ? map['updatedAt'] as int : DateTime.now().millisecondsSinceEpoch,
      expiresAt: map['expiresAt'] is int
          ? map['expiresAt'] as int
          : (DateTime.now().millisecondsSinceEpoch + 24 * 60 * 60 * 1000),
      messages: rawMessages
          .whereType<Map<String, dynamic>>()
          .map((m) => ChatMessageModel.fromMap(m))
          .toList(),
    );
  }
}

class MultimodalResultModel {
  final String extractedText;
  final String summary;
  final List<MCQModel> mcqs;
  final List<ImportantQuestionModel> shortQuestions;
  final String? source;

  List<MCQModel> get questions => mcqs;

  const MultimodalResultModel({
    required this.extractedText,
    required this.summary,
    required this.mcqs,
    required this.shortQuestions,
    this.source,
  });

  factory MultimodalResultModel.fromMap(Map<String, dynamic> map) {
    final rawMcqs = (map['mcqs'] as List<dynamic>?) ?? (map['questions'] as List<dynamic>?) ?? [];
    final rawShort = (map['shortQuestions'] as List<dynamic>?) ?? [];

    return MultimodalResultModel(
      extractedText: map['extractedText'] as String? ?? map['text'] as String? ?? map['result'] as String? ?? '',
      summary: map['summary'] as String? ?? '',
      mcqs: rawMcqs.asMap().entries.map((entry) => MCQModel.fromMap(entry.value, entry.key)).toList(),
      shortQuestions: rawShort.map((item) => ImportantQuestionModel.fromMap(item as Map<String, dynamic>)).toList(),
      source: map['source'] as String?,
    );
  }
}
