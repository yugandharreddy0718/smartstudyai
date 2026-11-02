import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../subjects/presentation/widgets/markdown_math_viewer.dart';
import '../providers/ai_providers.dart';

class AITutorScreen extends ConsumerStatefulWidget {
  final String? lessonContext;

  const AITutorScreen({super.key, this.lessonContext});

  @override
  ConsumerState<AITutorScreen> createState() => _AITutorScreenState();
}

class _AITutorScreenState extends ConsumerState<AITutorScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(chatNotifierProvider.notifier).loadChatHistory();
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatTime(DateTime dt) {
    final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  String _formatSessionDate(int ms) {
    final dt = DateTime.fromMillisecondsSinceEpoch(ms);
    final now = DateTime.now();
    if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
      return 'Today, ${_formatTime(dt)}';
    }
    final yesterday = now.subtract(const Duration(days: 1));
    if (dt.year == yesterday.year && dt.month == yesterday.month && dt.day == yesterday.day) {
      return 'Yesterday, ${_formatTime(dt)}';
    }
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  void _showHistoryModal(BuildContext context, ChatState chatState) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.65,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEEF2FF),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.history_rounded, color: Color(0xFF4F46E5), size: 20),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Chat History (24h)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                'Previous study sessions are automatically retained and synchronized with web.',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: chatState.sessions.isEmpty
                    ? const Center(
                        child: Text(
                          'No saved conversations yet.\nAsk a question to start your first session!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                        ),
                      )
                    : ListView.builder(
                        itemCount: chatState.sessions.length,
                        itemBuilder: (context, idx) {
                          final session = chatState.sessions[idx];
                          final isSelected = session.chatId == chatState.currentChatId;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFFEEF2FF) : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
                              ),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                              leading: const Icon(Icons.chat_bubble_outline_rounded,
                                  color: Color(0xFF4F46E5), size: 20),
                              title: Text(
                                session.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              subtitle: Text(
                                '${_formatSessionDate(session.updatedAt)} • ${session.messages.length} msgs',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                              ),
                              trailing: IconButton(
                                icon: const Icon(Icons.delete_outline_rounded,
                                    color: Color(0xFFF43F5E), size: 18),
                                onPressed: () {
                                  ref.read(chatNotifierProvider.notifier).deleteChat(session.chatId);
                                  Navigator.pop(ctx);
                                },
                              ),
                              onTap: () {
                                ref.read(chatNotifierProvider.notifier).selectChat(session);
                                Navigator.pop(ctx);
                              },
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatNotifierProvider);

    _scrollToBottom();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFEEF2FF),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.psychology_rounded, color: Color(0xFF4F46E5), size: 22),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '24/7 AI Tutor Chat',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
                Text(
                  'Cloud Synchronized',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF10B981),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          Tooltip(
            message: 'New Chat',
            child: IconButton(
              icon: const Icon(Icons.add_comment_rounded, color: Color(0xFF4F46E5)),
              onPressed: () {
                ref.read(chatNotifierProvider.notifier).startNewChat();
              },
            ),
          ),
          Tooltip(
            message: 'Chat History',
            child: IconButton(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.history_rounded, color: Color(0xFF4F46E5)),
                  if (chatState.sessions.isNotEmpty)
                    Positioned(
                      right: -4,
                      top: -4,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Color(0xFF4F46E5),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${chatState.sessions.length}',
                          style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),
              onPressed: () => _showHistoryModal(context, chatState),
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: chatState.messages.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(28.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEEF2FF),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF4F46E5).withValues(alpha: 0.15),
                                  blurRadius: 16,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Icon(Icons.auto_awesome_rounded, size: 48, color: Color(0xFF4F46E5)),
                          ),
                          const SizedBox(height: 18),
                          const Text(
                            'Ask your AI Tutor anything!',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Get instant help with formulas, definitions, problem solving, and concept clarification.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
                          ),
                          const SizedBox(height: 20),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            alignment: WrapAlignment.center,
                            children: [
                              _buildQuickPromptChip('Explain Photosynthesis'),
                              _buildQuickPromptChip('Quick Algebra Quiz'),
                              _buildQuickPromptChip('Formula for Kinetic Energy'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    itemCount: chatState.messages.length,
                    itemBuilder: (context, idx) {
                      final msg = chatState.messages[idx];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 14.0),
                        child: Align(
                          alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
                          child: Column(
                            crossAxisAlignment:
                                msg.isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                constraints: BoxConstraints(
                                  maxWidth: MediaQuery.of(context).size.width * 0.82,
                                ),
                                decoration: BoxDecoration(
                                  color: msg.isUser ? const Color(0xFF0F172A) : Colors.white,
                                  borderRadius: BorderRadius.circular(18).copyWith(
                                    bottomRight: msg.isUser ? const Radius.circular(2) : const Radius.circular(18),
                                    bottomLeft: !msg.isUser ? const Radius.circular(2) : const Radius.circular(18),
                                  ),
                                  border: msg.isUser
                                      ? null
                                      : Border.all(color: const Color(0xFFE2E8F0)),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.03),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: msg.isUser
                                    ? Text(
                                        msg.text,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          height: 1.35,
                                        ),
                                      )
                                    : MarkdownMathViewer(data: msg.text),
                              ),
                              const SizedBox(height: 3),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4.0),
                                child: Text(
                                  _formatTime(msg.timestamp),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: Color(0xFF94A3B8),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          if (chatState.isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF4F46E5)),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'AI Tutor is preparing your explanation...',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          if (chatState.error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFECDD3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, color: Color(0xFFF43F5E), size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        chatState.error!,
                        style: const TextStyle(color: Color(0xFFE11D48), fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: TextField(
                        controller: _textController,
                        style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A)),
                        decoration: const InputDecoration(
                          hintText: 'Ask about concepts, formulas or questions...',
                          hintStyle: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        onSubmitted: (val) => _send(val),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: () => _send(_textController.text),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4F46E5),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickPromptChip(String prompt) {
    return ActionChip(
      label: Text(
        prompt,
        style: const TextStyle(fontSize: 11, color: Color(0xFF4F46E5), fontWeight: FontWeight.bold),
      ),
      backgroundColor: const Color(0xFFEEF2FF),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Color(0xFFC7D2FE)),
      ),
      onPressed: () {
        _textController.text = prompt;
        _send(prompt);
      },
    );
  }

  void _send(String text) {
    if (text.trim().isEmpty) return;
    ref.read(chatNotifierProvider.notifier).sendMessage(text, widget.lessonContext ?? '');
    _textController.clear();
  }
}
