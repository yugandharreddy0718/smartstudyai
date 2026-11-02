import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../authentication/providers/auth_state_provider.dart';
import '../domain/ai_models.dart';
import '../providers/ai_providers.dart';

class MCQGeneratorScreen extends ConsumerStatefulWidget {
  final String lessonId;
  final String title;
  final String content;

  const MCQGeneratorScreen({
    super.key,
    required this.lessonId,
    required this.title,
    required this.content,
  });

  @override
  ConsumerState<MCQGeneratorScreen> createState() => _MCQGeneratorScreenState();
}

class _MCQGeneratorScreenState extends ConsumerState<MCQGeneratorScreen> {
  int _selectedCount = 5;
  String _selectedDifficulty = 'Medium';
  bool _isStarted = false;
  int _currentIndex = 0;
  final Map<int, int> _userAnswers = {};
  bool _isSubmitted = false;

  Future<void> _recordQuizSubmission(List<MCQModel> questions) async {
    final authState = ref.read(authStateProvider);
    final user = authState.user;
    if (user == null) return;

    int score = 0;
    for (int i = 0; i < questions.length; i++) {
      if (_userAnswers[i] == questions[i].correctIndex) {
        score++;
      }
    }
    final percentage = (score / questions.length * 100).round();
    final now = DateTime.now().millisecondsSinceEpoch;
    final attemptId = 'quiz_${now}_${user.id.substring(0, user.id.length >= 5 ? 5 : user.id.length)}';

    final firestore = ref.read(firestoreProvider);
    final payload = {
      'id': attemptId,
      'uid': user.id,
      'userEmail': user.email,
      'displayName': user.displayName,
      'lessonId': widget.lessonId,
      'lessonTitle': widget.title,
      'score': score,
      'totalQuestions': questions.length,
      'percentage': percentage,
      'difficulty': _selectedDifficulty,
      'completedAt': now,
      'createdAt': now,
    };

    try {
      // 1. Record globally under quizzes for admin dashboard stats
      await firestore.collection('quizzes').doc(attemptId).set(payload, SetOptions(merge: true));

      // 2. Record under user profile subcollection
      await firestore.collection('users').doc(user.id).collection('quizAttempts').doc(attemptId).set(payload, SetOptions(merge: true));

      // 3. Award XP for taking quiz
      await firestore.collection('users').doc(user.id).set({
        'xp': FieldValue.increment(score * 10),
      }, SetOptions(merge: true));
    } catch (e) {
      debugPrint('Notice recording quiz attempt in Firestore: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isStarted) {
      return _buildConfigScreen(context);
    }

    final req = McqConfigRequest(
      lessonId: widget.lessonId,
      title: widget.title,
      content: widget.content,
      count: _selectedCount,
      difficulty: _selectedDifficulty,
    );

    final mcqAsync = ref.watch(mcqListProvider(req));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          _isSubmitted ? 'Quiz Results' : 'MCQ Assessment',
          style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () {
            if (_isStarted) {
              setState(() {
                _isStarted = false;
                _isSubmitted = false;
                _userAnswers.clear();
                _currentIndex = 0;
              });
            } else {
              Navigator.pop(context);
            }
          },
        ),
      ),
      body: mcqAsync.when(
        data: (questions) {
          if (questions.isEmpty) {
            return const Center(child: Text('No questions generated.'));
          }

          if (_isSubmitted) {
            return _buildResultsScreen(context, questions);
          }

          final currentQ = questions[_currentIndex];

          return Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: (_currentIndex + 1) / questions.length,
                    color: const Color(0xFF4F46E5),
                    backgroundColor: const Color(0xFFE2E8F0),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Question ${_currentIndex + 1} of ${questions.length}',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        _selectedDifficulty,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFF1F5F9)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Text(
                    currentQ.question,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A), height: 1.4),
                  ),
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: ListView.builder(
                    itemCount: currentQ.options.length,
                    itemBuilder: (context, optIdx) {
                      final isSelected = _userAnswers[_currentIndex] == optIdx;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          color: isSelected ? const Color(0xFFEEF2FF) : Colors.white,
                        ),
                        child: ListTile(
                          title: Text(
                            currentQ.options[optIdx],
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFF334155),
                            ),
                          ),
                          // ignore: deprecated_member_use
                          leading: Radio<int>(
                            value: optIdx,
                            // ignore: deprecated_member_use
                            groupValue: _userAnswers[_currentIndex],
                            activeColor: const Color(0xFF4F46E5),
                            // ignore: deprecated_member_use
                            onChanged: (val) {
                              setState(() {
                                _userAnswers[_currentIndex] = val!;
                              });
                            },
                          ),
                          onTap: () {
                            setState(() {
                              _userAnswers[_currentIndex] = optIdx;
                            });
                          },
                        ),
                      );
                    },
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (_currentIndex > 0)
                      OutlinedButton(
                        onPressed: () {
                          setState(() {
                            _currentIndex--;
                          });
                        },
                        style: OutlinedButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        ),
                        child: const Text('Previous'),
                      )
                    else
                      const SizedBox(),
                    if (_currentIndex < questions.length - 1)
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _currentIndex++;
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F172A),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        ),
                        child: const Text('Next'),
                      )
                    else
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        ),
                        onPressed: _userAnswers.length == questions.length
                            ? () {
                                setState(() {
                                  _isSubmitted = true;
                                });
                                _recordQuizSubmission(questions);
                              }
                            : null,
                        child: const Text('Submit Quiz', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
              ],
            ),
          );
        },
        loading: () => const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Color(0xFF4F46E5)),
              SizedBox(height: 16),
              Text('Generating MCQ Questions with AI...', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            ],
          ),
        ),
        error: (err, st) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 12),
              Text('Failed to generate MCQs: $err'),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.refresh(mcqListProvider(req)),
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConfigScreen(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Configure MCQ Quiz', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Number of Questions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 12),
            SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 5, label: Text('5')),
                ButtonSegment(value: 10, label: Text('10')),
                ButtonSegment(value: 15, label: Text('15')),
                ButtonSegment(value: 20, label: Text('20')),
              ],
              selected: {_selectedCount},
              onSelectionChanged: (val) {
                setState(() {
                  _selectedCount = val.first;
                });
              },
            ),
            const SizedBox(height: 28),
            const Text('Difficulty Level', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 12),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'Easy', label: Text('Easy')),
                ButtonSegment(value: 'Medium', label: Text('Medium')),
                ButtonSegment(value: 'Hard', label: Text('Hard')),
                ButtonSegment(value: 'Mixed', label: Text('Mixed')),
              ],
              selected: {_selectedDifficulty},
              onSelectionChanged: (val) {
                setState(() {
                  _selectedDifficulty = val.first;
                });
              },
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _isStarted = true;
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                icon: const Icon(Icons.play_arrow_rounded),
                label: const Text('Generate & Start Quiz', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsScreen(BuildContext context, List<MCQModel> questions) {
    int score = 0;
    for (int i = 0; i < questions.length; i++) {
      if (_userAnswers[i] == questions[i].correctIndex) {
        score++;
      }
    }
    final percentage = (score / questions.length * 100).round();

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: percentage >= 70 ? const Color(0xFFECFDF5) : const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: percentage >= 70 ? const Color(0xFFA7F3D0) : const Color(0xFFFED7AA)),
            ),
            child: Column(
              children: [
                Text(
                  'Score: $score / ${questions.length} ($percentage%)',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: percentage >= 70 ? const Color(0xFF065F46) : const Color(0xFF9A3412),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  percentage >= 70 ? 'Great job! Mastery achieved.' : 'Keep practicing to improve your score!',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: percentage >= 70 ? const Color(0xFF047857) : const Color(0xFFC2410C),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: ListView.builder(
              itemCount: questions.length,
              itemBuilder: (context, idx) {
                final q = questions[idx];
                final userAns = _userAnswers[idx];
                final isCorrect = userAns == q.correctIndex;
                final correctText = q.options.isNotEmpty && q.correctIndex < q.options.length ? q.options[q.correctIndex] : 'Option D';
                final userText = userAns != null && userAns < q.options.length ? q.options[userAns] : 'Not answered';

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFF1F5F9)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded, color: isCorrect ? Colors.green : const Color(0xFFF43F5E), size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Q${idx + 1}: ${q.question}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Your Answer: $userText',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isCorrect ? Colors.green : const Color(0xFFF43F5E)),
                      ),
                      if (!isCorrect) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Correct Answer: $correctText',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green),
                        ),
                      ],
                      if (q.explanation.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Explanation: ${q.explanation}',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), height: 1.4),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  _isStarted = false;
                  _isSubmitted = false;
                  _userAnswers.clear();
                  _currentIndex = 0;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.restart_alt_rounded),
              label: const Text('Try Another Quiz', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
