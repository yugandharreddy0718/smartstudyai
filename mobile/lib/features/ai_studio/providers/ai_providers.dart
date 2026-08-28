import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/ai_service.dart';
import '../domain/ai_models.dart';

// Request Parameters
class LessonAiRequest {
  final String lessonId;
  final String title;
  final String content;

  LessonAiRequest({required this.lessonId, required this.title, required this.content});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is LessonAiRequest &&
          runtimeType == other.runtimeType &&
          lessonId == other.lessonId &&
          title == other.title &&
          content == other.content;

  @override
  int get hashCode => lessonId.hashCode ^ title.hashCode ^ content.hashCode;
}

// 1. AI Summary Provider
final aiSummaryProvider = FutureProvider.family<String, LessonAiRequest>((ref, req) async {
  return await AIService.generateSummary(
    lessonId: req.lessonId,
    title: req.title,
    content: req.content,
  );
});

// 2. High-Yield Important Q&A Provider
final importantQuestionsProvider = FutureProvider.family<List<ImportantQuestionModel>, LessonAiRequest>((ref, req) async {
  return await AIService.generateImportantQuestions(
    lessonId: req.lessonId,
    title: req.title,
    content: req.content,
  );
});

// MCQ Config Request
class McqConfigRequest {
  final String lessonId;
  final String title;
  final String content;
  final int count;
  final String difficulty;

  McqConfigRequest({
    required this.lessonId,
    required this.title,
    required this.content,
    this.count = 5,
    this.difficulty = 'Medium',
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is McqConfigRequest &&
          runtimeType == other.runtimeType &&
          lessonId == other.lessonId &&
          count == other.count &&
          difficulty == other.difficulty;

  @override
  int get hashCode => lessonId.hashCode ^ count.hashCode ^ difficulty.hashCode;
}

// 3. MCQ Generator & Quiz Provider
final mcqListProvider = FutureProvider.family<List<MCQModel>, McqConfigRequest>((ref, req) async {
  return await AIService.generateMCQs(
    lessonId: req.lessonId,
    title: req.title,
    content: req.content,
    count: req.count,
    difficulty: req.difficulty,
  );
});

// 4. AI Tutor Chat State Notifier
class ChatState {
  final List<ChatMessageModel> messages;
  final bool isLoading;
  final String? error;

  ChatState({required this.messages, this.isLoading = false, this.error});

  ChatState copyWith({
    List<ChatMessageModel>? messages,
    bool? isLoading,
    String? error,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class ChatNotifier extends Notifier<ChatState> {
  @override
  ChatState build() {
    return ChatState(messages: []);
  }

  Future<void> sendMessage(String userText, String contextText) async {
    if (userText.trim().isEmpty) return;

    final userMsg = ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: userText,
      isUser: true,
      timestamp: DateTime.now(),
    );

    state = state.copyWith(
      messages: [...state.messages, userMsg],
      isLoading: true,
      error: null,
    );

    try {
      final replyText = await AIService.chatWithTutor(
        userMessage: userText,
        lessonContext: contextText,
        history: state.messages,
      );

      final aiMsg = ChatMessageModel(
        id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
        text: replyText,
        isUser: false,
        timestamp: DateTime.now(),
      );

      state = state.copyWith(
        messages: [...state.messages, aiMsg],
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to send message. Please try again.',
      );
    }
  }

  void clearChat() {
    state = ChatState(messages: []);
  }
}

final chatNotifierProvider = NotifierProvider<ChatNotifier, ChatState>(ChatNotifier.new);
