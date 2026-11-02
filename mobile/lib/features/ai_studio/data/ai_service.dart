import 'dart:async';
import '../../../core/api/api_client.dart';
import '../domain/ai_models.dart';

class AIService {
  // 1. AI Summary Generator
  static Future<String> generateSummary({
    required String lessonId,
    required String title,
    required String content,
  }) async {
    final res = await ApiClient.post('/api/gemini/summary', {
      'text': content,
    });

    if (res is Map && res.containsKey('result') && res['result'] != null && res['result'].toString().trim().isNotEmpty) {
      return res['result'].toString();
    } else if (res is Map && res.containsKey('summary') && res['summary'] != null && res['summary'].toString().trim().isNotEmpty) {
      return res['summary'].toString();
    } else if (res is Map && res.containsKey('text') && res['text'] != null && res['text'].toString().trim().isNotEmpty) {
      return res['text'].toString();
    }
    throw Exception('Failed to generate summary.');
  }

  // 2. High-Yield Important Q&A Generator
  static Future<List<ImportantQuestionModel>> generateImportantQuestions({
    required String lessonId,
    required String title,
    required String content,
  }) async {
    final res = await ApiClient.post('/api/gemini/important-questions', {
      'text': content,
    });

    List<dynamic>? list;
    if (res is Map && res.containsKey('result') && res['result'] is List) {
      list = res['result'] as List<dynamic>;
    } else if (res is Map && res.containsKey('questions') && res['questions'] is List) {
      list = res['questions'] as List<dynamic>;
    } else if (res is List) {
      list = res;
    }

    if (list != null && list.isNotEmpty) {
      return list.map((item) => ImportantQuestionModel.fromMap(item as Map<String, dynamic>)).toList();
    }
    return [];
  }

  // 3. Standalone MCQ Generator & Quiz
  static Future<List<MCQModel>> generateMCQs({
    required String lessonId,
    required String title,
    required String content,
    int count = 5,
    String difficulty = 'medium',
  }) async {
    final res = await ApiClient.post('/api/gemini/mcq-generator', {
      'text': content,
      'count': count,
      'difficulty': difficulty,
    });

    List<dynamic>? list;
    if (res is Map && res.containsKey('result') && res['result'] is List) {
      list = res['result'] as List<dynamic>;
    } else if (res is Map && res.containsKey('questions') && res['questions'] is List) {
      list = res['questions'] as List<dynamic>;
    } else if (res is List) {
      list = res;
    }

    if (list != null && list.isNotEmpty) {
      return list.asMap().entries.map((entry) => MCQModel.fromMap(entry.value as Map<String, dynamic>, entry.key)).toList();
    }
    throw Exception('No practice questions could be generated from this content.');
  }

  // 4. Interactive Quiz Generator
  static Future<List<Map<String, dynamic>>> generateQuiz({
    required String content,
    int count = 5,
  }) async {
    final res = await ApiClient.post('/api/gemini/quiz', {
      'text': content,
      'count': count,
    });

    if (res is Map && res.containsKey('result') && res['result'] is List) {
      return (res['result'] as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } else if (res is List) {
      return res.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    throw Exception('Failed to generate interactive quiz.');
  }

  // 5. 24/7 AI Tutor Chat Assistant
  static Future<String> chatWithTutor({
    required String userMessage,
    required List<ChatMessageModel> history,
  }) async {
    final formattedHistory = history.map((m) => {
      'role': m.isUser ? 'user' : 'assistant',
      'content': m.text
    }).toList();

    final res = await ApiClient.post('/api/gemini/chat', {
      'history': formattedHistory,
      'message': userMessage,
    });

    if (res is Map && res.containsKey('result') && res['result'] != null) {
      return res['result'].toString();
    } else if (res is Map && res.containsKey('reply') && res['reply'] != null) {
      return res['reply'].toString();
    } else if (res is Map && res.containsKey('response') && res['response'] != null) {
      return res['response'].toString();
    }
    return res.toString();
  }

  // 6. Multimodal Document OCR & Analysis (Extracts Text Only ONCE)
  static Future<MultimodalResultModel> analyzeDocument({
    required String base64Data,
    required String mimeType,
    required String fileName,
  }) async {
    final res = await ApiClient.post('/api/gemini/multimodal', {
      'fileData': {
        'mimeType': mimeType,
        'data': base64Data,
      },
      'fileName': fileName,
    });

    if (res is Map) {
      if (res['success'] == false) {
        final errMsg = (res['error'] ?? res['message'] ?? 'Document text extraction failed.').toString();
        throw Exception(errMsg);
      }
      final resultText = (res['text'] ?? res['extractedText'] ?? res['result'] ?? '').toString();
      if (resultText.trim().isNotEmpty) {
        return MultimodalResultModel(
          extractedText: resultText.trim(),
          summary: '',
          mcqs: [],
          shortQuestions: [],
          source: res['source']?.toString(),
        );
      }
    }
    throw Exception('No readable text was found in this document. It may be a scanned or image-only PDF.');
  }
}
