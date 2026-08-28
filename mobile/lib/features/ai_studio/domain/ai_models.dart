class ImportantQuestionModel {
  final String markCategory; // "1 MARK", "2 MARK", "3 MARK", "5 MARK"
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
    return ImportantQuestionModel(
      markCategory: map['markCategory'] as String? ?? '2 MARK',
      question: map['question'] as String? ?? '',
      answer: map['answer'] as String? ?? '',
      markingPoints: (map['markingPoints'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
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
    return MCQModel(
      id: map['id']?.toString() ?? 'q_\$defaultIdx',
      question: map['question'] as String? ?? '',
      options: (map['options'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      correctIndex: map['correctIndex'] as int? ?? map['answerIndex'] as int? ?? 0,
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
}

class MultimodalResultModel {
  final String extractedText;
  final String summary;
  final List<MCQModel> questions;

  const MultimodalResultModel({
    required this.extractedText,
    required this.summary,
    required this.questions,
  });

  factory MultimodalResultModel.fromMap(Map<String, dynamic> map) {
    final rawMcqs = (map['questions'] as List<dynamic>?) ?? [];
    return MultimodalResultModel(
      extractedText: map['extractedText'] as String? ?? map['text'] as String? ?? '',
      summary: map['summary'] as String? ?? '',
      questions: rawMcqs.asMap().entries.map((entry) => MCQModel.fromMap(entry.value, entry.key)).toList(),
    );
  }
}
