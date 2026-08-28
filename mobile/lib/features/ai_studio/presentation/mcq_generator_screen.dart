import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
      appBar: AppBar(
        title: Text(_isSubmitted ? 'Quiz Results' : 'MCQ Assessment'),
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
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LinearProgressIndicator(
                  value: (_currentIndex + 1) / questions.length,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Question \${_currentIndex + 1} of \${questions.length}',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    Chip(
                      label: Text(_selectedDifficulty),
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Card(
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      currentQ.question,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: ListView.builder(
                    itemCount: currentQ.options.length,
                    itemBuilder: (context, optIdx) {
                      final isSelected = _userAnswers[_currentIndex] == optIdx;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade300,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          color: isSelected ? Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3) : null,
                        ),
                        child: ListTile(
                          title: Text(currentQ.options[optIdx]),
                          leading: Radio<int>(
                            value: optIdx,
                            groupValue: _userAnswers[_currentIndex],
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
                        child: const Text('Next'),
                      )
                    else
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: _userAnswers.length == questions.length
                            ? () {
                                setState(() {
                                  _isSubmitted = true;
                                });
                              }
                            : null,
                        child: const Text('Submit Quiz'),
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
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Generating MCQ Questions with AI...'),
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
      appBar: AppBar(title: const Text('Configure MCQ Quiz')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Number of Questions', style: Theme.of(context).textTheme.titleMedium),
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
            const SizedBox(height: 24),
            Text('Difficulty Level', style: Theme.of(context).textTheme.titleMedium),
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
              height: 50,
              child: ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    _isStarted = true;
                  });
                },
                icon: const Icon(Icons.play_arrow),
                label: const Text('Generate & Start Quiz', style: TextStyle(fontSize: 16)),
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
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Card(
            color: percentage >= 70 ? Colors.green.shade50 : Colors.orange.shade50,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  Text(
                    'Score: $score / \${questions.length} ($percentage%)',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: percentage >= 70 ? Colors.green.shade800 : Colors.orange.shade800,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(percentage >= 70 ? 'Great job! Mastery achieved.' : 'Keep practicing to improve!'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: questions.length,
              itemBuilder: (context, idx) {
                final q = questions[idx];
                final userAns = _userAnswers[idx];
                final isCorrect = userAns == q.correctIndex;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(isCorrect ? Icons.check_circle : Icons.cancel, color: isCorrect ? Colors.green : Colors.red),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Q\${idx + 1}: \${q.question}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Your Answer: \${userAns != null ? q.options[userAns] : "Not answered"}',
                            style: TextStyle(color: isCorrect ? Colors.green : Colors.red)),
                        if (!isCorrect)
                          Text('Correct Answer: \${q.options[q.correctIndex]}', style: const TextStyle(color: Colors.green)),
                        const SizedBox(height: 4),
                        Text('Explanation: \${q.explanation}', style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          ElevatedButton.icon(
            onPressed: () {
              setState(() {
                _isStarted = false;
                _isSubmitted = false;
                _userAnswers.clear();
                _currentIndex = 0;
              });
            },
            icon: const Icon(Icons.restart_alt),
            label: const Text('Try Another Quiz'),
          ),
        ],
      ),
    );
  }
}
