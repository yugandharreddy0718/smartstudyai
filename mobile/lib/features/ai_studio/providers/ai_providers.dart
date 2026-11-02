import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../data/ai_service.dart';
import '../domain/ai_models.dart';
import '../../authentication/providers/auth_state_provider.dart';

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

// 4. AI Tutor Chat State Notifier with Firestore Persistence (24h+ retention)
class ChatState {
  final String currentChatId;
  final List<ChatMessageModel> messages;
  final List<ChatSessionModel> sessions;
  final bool isLoading;
  final bool isLoadingHistory;
  final String? error;

  ChatState({
    required this.currentChatId,
    required this.messages,
    this.sessions = const [],
    this.isLoading = false,
    this.isLoadingHistory = false,
    this.error,
  });

  ChatState copyWith({
    String? currentChatId,
    List<ChatMessageModel>? messages,
    List<ChatSessionModel>? sessions,
    bool? isLoading,
    bool? isLoadingHistory,
    String? error,
  }) {
    return ChatState(
      currentChatId: currentChatId ?? this.currentChatId,
      messages: messages ?? this.messages,
      sessions: sessions ?? this.sessions,
      isLoading: isLoading ?? this.isLoading,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
      error: error,
    );
  }
}

class ChatNotifier extends Notifier<ChatState> {
  static const int retentionMs = 24 * 60 * 60 * 1000; // 24 hours retention

  @override
  ChatState build() {
    final initialId = 'chat_${DateTime.now().millisecondsSinceEpoch}';
    // Async initialize history if user is authenticated
    Future.microtask(() => loadChatHistory());
    return ChatState(
      currentChatId: initialId,
      messages: [],
    );
  }

  Future<void> loadChatHistory() async {
    final authUser = ref.read(authStateProvider).user;
    if (authUser == null || authUser.id.isEmpty) return;

    state = state.copyWith(isLoadingHistory: true);

    try {
      final firestore = ref.read(firestoreProvider);
      final chatsSnap = await firestore
          .collection('users')
          .doc(authUser.id)
          .collection('aiChats')
          .orderBy('updatedAt', descending: true)
          .limit(50)
          .get();

      final now = DateTime.now().millisecondsSinceEpoch;
      final loadedSessions = <ChatSessionModel>[];

      for (final doc in chatsSnap.docs) {
        final data = doc.data();
        final session = ChatSessionModel.fromMap(data, doc.id);
        // Retain if active within retention window
        if (session.expiresAt > (now - retentionMs)) {
          loadedSessions.add(session);
        }
      }

      if (loadedSessions.isNotEmpty) {
        // If current session is empty, restore the most recently updated session
        if (state.messages.isEmpty) {
          final mostRecent = loadedSessions.first;
          state = state.copyWith(
            currentChatId: mostRecent.chatId,
            messages: mostRecent.messages,
            sessions: loadedSessions,
            isLoadingHistory: false,
          );
        } else {
          state = state.copyWith(
            sessions: loadedSessions,
            isLoadingHistory: false,
          );
        }
      } else {
        state = state.copyWith(
          sessions: [],
          isLoadingHistory: false,
        );
      }
    } catch (e) {
      // Graceful fallback for offline / uninitialized state
      state = state.copyWith(isLoadingHistory: false);
    }
  }

  void startNewChat() {
    final newChatId = 'chat_${DateTime.now().millisecondsSinceEpoch}';
    state = state.copyWith(
      currentChatId: newChatId,
      messages: [],
      error: null,
    );
  }

  void selectChat(ChatSessionModel session) {
    state = state.copyWith(
      currentChatId: session.chatId,
      messages: session.messages,
      error: null,
    );
  }

  Future<void> deleteChat(String chatId) async {
    final authUser = ref.read(authStateProvider).user;
    final updatedSessions = state.sessions.where((s) => s.chatId != chatId).toList();

    if (state.currentChatId == chatId) {
      startNewChat();
    } else {
      state = state.copyWith(sessions: updatedSessions);
    }

    if (authUser != null && authUser.id.isNotEmpty) {
      try {
        final firestore = ref.read(firestoreProvider);
        await firestore
            .collection('users')
            .doc(authUser.id)
            .collection('aiChats')
            .doc(chatId)
            .delete();
      } catch (e) {
        // Ignored
      }
    }
  }

  Future<void> sendMessage(String userText, String contextText) async {
    if (userText.trim().isEmpty) return;

    final authUser = ref.read(authStateProvider).user;
    final now = DateTime.now().millisecondsSinceEpoch;

    final userMsg = ChatMessageModel(
      id: 'msg_$now',
      text: userText.trim(),
      isUser: true,
      timestamp: DateTime.now(),
    );

    final updatedMessages = [...state.messages, userMsg];
    final titleSnippet = userText.length > 38 ? '${userText.substring(0, 38)}...' : userText;

    state = state.copyWith(
      messages: updatedMessages,
      isLoading: true,
      error: null,
    );

    // Save user message immediately to Firestore
    if (authUser != null && authUser.id.isNotEmpty) {
      _saveToFirestore(
        userId: authUser.id,
        chatId: state.currentChatId,
        title: titleSnippet,
        messages: updatedMessages,
        now: now,
      );
    }

    try {
      final replyText = await AIService.chatWithTutor(
        userMessage: contextText.isNotEmpty ? 'Context: $contextText\n\nQuestion: $userText' : userText,
        history: updatedMessages,
      );

      final aiMsg = ChatMessageModel(
        id: 'msg_${now + 1}',
        text: replyText,
        isUser: false,
        timestamp: DateTime.now(),
      );

      final finalMessages = [...updatedMessages, aiMsg];

      state = state.copyWith(
        messages: finalMessages,
        isLoading: false,
        error: null,
      );

      // Persist complete conversation to Firestore with renewed 24-hr expiresAt
      if (authUser != null && authUser.id.isNotEmpty) {
        await _saveToFirestore(
          userId: authUser.id,
          chatId: state.currentChatId,
          title: titleSnippet,
          messages: finalMessages,
          now: DateTime.now().millisecondsSinceEpoch,
        );
      }
    } catch (e) {
      final cleanErr = e.toString().replaceAll(RegExp(r'^Exception:\s*'), '');
      final isQuota = cleanErr.toLowerCase().contains('quota') || cleanErr.contains('429');
      state = state.copyWith(
        isLoading: false,
        error: isQuota
            ? 'AI Tutor is temporarily resting due to API rate limits. Please try again shortly.'
            : cleanErr,
      );
    }
  }

  Future<void> _saveToFirestore({
    required String userId,
    required String chatId,
    required String title,
    required List<ChatMessageModel> messages,
    required int now,
  }) async {
    try {
      final firestore = ref.read(firestoreProvider);
      final payload = {
        'chatId': chatId,
        'userId': userId,
        'title': title,
        'createdAt': messages.isNotEmpty ? messages.first.timestamp.millisecondsSinceEpoch : now,
        'updatedAt': now,
        'expiresAt': now + retentionMs,
        'messages': messages.map((m) => m.toMap()).toList(),
      };

      await firestore
          .collection('users')
          .doc(userId)
          .collection('aiChats')
          .doc(chatId)
          .set(payload, SetOptions(merge: true));

      // Refresh session in local list
      final newSession = ChatSessionModel.fromMap(payload, chatId);
      final filtered = state.sessions.where((s) => s.chatId != chatId).toList();
      state = state.copyWith(sessions: [newSession, ...filtered]);
    } catch (e) {
      // Ignored for offline mode
    }
  }

  void clearChat() {
    startNewChat();
  }
}

final chatNotifierProvider = NotifierProvider<ChatNotifier, ChatState>(ChatNotifier.new);
