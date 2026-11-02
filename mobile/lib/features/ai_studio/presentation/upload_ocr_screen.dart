import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../data/ai_service.dart';
import '../domain/ai_models.dart';
import '../../subjects/presentation/widgets/markdown_math_viewer.dart';

class UploadOCRScreen extends StatefulWidget {
  const UploadOCRScreen({super.key});

  @override
  State<UploadOCRScreen> createState() => _UploadOCRScreenState();
}

class _UploadOCRScreenState extends State<UploadOCRScreen> {
  bool _isLoading = false;
  bool _isGeneratingSummary = false;
  bool _isGeneratingQuestions = false;
  String? _fileName;
  String? _error;
  String? _summaryError;
  String? _questionsError;
  MultimodalResultModel? _result;

  Future<void> _fetchSummary() async {
    if (_result == null || _result!.extractedText.isEmpty) return;
    setState(() {
      _isGeneratingSummary = true;
      _summaryError = null;
    });
    try {
      final summaryText = await AIService.generateSummary(
        lessonId: 'doc_summary',
        title: _fileName ?? 'Document',
        content: _result!.extractedText,
      );
      setState(() {
        _result = MultimodalResultModel(
          extractedText: _result!.extractedText,
          summary: summaryText,
          mcqs: _result!.mcqs,
          shortQuestions: _result!.shortQuestions,
        );
        _isGeneratingSummary = false;
      });
    } catch (e) {
      final cleanErr = e.toString().replaceAll(RegExp(r'^Exception:\s*'), '');
      final isQuota = cleanErr.toLowerCase().contains('quota') || cleanErr.contains('429');
      setState(() {
        _isGeneratingSummary = false;
        _summaryError = isQuota
            ? 'AI summary is temporarily unavailable because the AI daily quota has been exhausted. Your extracted document text is still available.'
            : cleanErr;
      });
    }
  }

  Future<void> _fetchQuestions() async {
    if (_result == null || _result!.extractedText.isEmpty) return;
    setState(() {
      _isGeneratingQuestions = true;
      _questionsError = null;
    });
    try {
      final mcqs = await AIService.generateMCQs(
        lessonId: 'doc_mcqs',
        title: _fileName ?? 'Document',
        content: _result!.extractedText,
        count: 5,
        difficulty: 'medium',
      );
      final shortQuestions = await AIService.generateImportantQuestions(
        lessonId: 'doc_short_qa',
        title: _fileName ?? 'Document',
        content: _result!.extractedText,
      );
      setState(() {
        _result = MultimodalResultModel(
          extractedText: _result!.extractedText,
          summary: _result!.summary,
          mcqs: mcqs,
          shortQuestions: shortQuestions,
        );
        _isGeneratingQuestions = false;
      });
    } catch (e) {
      final cleanErr = e.toString().replaceAll(RegExp(r'^Exception:\s*'), '');
      final isQuota = cleanErr.toLowerCase().contains('quota') || cleanErr.contains('429');
      setState(() {
        _isGeneratingQuestions = false;
        _questionsError = isQuota
            ? 'AI quiz generation is temporarily unavailable because the AI daily quota has been exhausted. Your extracted document text is still available.'
            : cleanErr;
      });
    }
  }

  Future<void> _pickAndAnalyzeFile() async {
    try {
      final result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
      );

      if (result.isNotEmpty) {
        final file = result.first;

        setState(() {
          _fileName = file.name;
          _isLoading = true;
          _error = null;
          _summaryError = null;
          _questionsError = null;
        });

        Uint8List? bytes;
        try {
          bytes = await file.readAsBytes();
        } catch (e) {
          debugPrint('DEBUG: Error reading file via readAsBytes(): $e');
        }

        if ((bytes == null || bytes.isEmpty) && file.path != null && file.path!.isNotEmpty) {
          try {
            final localFile = File(file.path!);
            if (await localFile.exists()) {
              bytes = await localFile.readAsBytes();
            }
          } catch (e) {
            debugPrint('DEBUG: Error reading local file path ${file.path}: $e');
          }
        }

        final fileSize = bytes?.length ?? 0;

        if (bytes == null || bytes.isEmpty) {
          throw Exception('Could not read file data from ${file.name}. Please select a valid document or image.');
        }

        final base64Content = base64Encode(bytes);
        final ext = (file.extension ?? file.name.split('.').last).toLowerCase();
        final mimeType = ext == 'pdf'
            ? 'application/pdf'
            : ext == 'jpg' || ext == 'jpeg'
                ? 'image/jpeg'
                : 'image/png';

        final previewChars = base64Content.length > 50 ? base64Content.substring(0, 50) : base64Content;

        debugPrint('==================================================');
        debugPrint('DEBUG: MULTIMODAL OCR PROCESS STARTED');
        debugPrint('SELECTED FILENAME: ${file.name}');
        debugPrint('FILE TYPE / EXTENSION: $ext ($mimeType)');
        debugPrint('FILE SIZE: $fileSize bytes');
        debugPrint('BASE64 PREVIEW: $previewChars...');
        debugPrint('BACKEND ENDPOINT: /api/gemini/multimodal');
        debugPrint('==================================================');

        final res = await AIService.analyzeDocument(
          base64Data: base64Content,
          mimeType: mimeType,
          fileName: file.name,
        );

        final textSnippet = res.extractedText.length > 200 ? res.extractedText.substring(0, 200) : res.extractedText;

        debugPrint('==================================================');
        debugPrint('DEBUG: MULTIMODAL OCR PROCESS SUCCESSFUL');
        debugPrint('filename: ${file.name}');
        debugPrint('mimeType: $mimeType');
        debugPrint('PDF detected: ${ext == 'pdf'}');
        debugPrint('parser used: ${res.source}');
        debugPrint('HTTP status: 200 OK');
        debugPrint('response success: true');
        debugPrint('response source: ${res.source}');
        debugPrint('response text length: ${res.extractedText.length}');
        debugPrint('first 200 characters of response text: $textSnippet');
        debugPrint('model text length: ${res.extractedText.length}');
        debugPrint('UploadOCRScreen textContent length: ${res.extractedText.length}');
        debugPrint('==================================================');

        setState(() {
          _result = res;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('DEBUG: Error picking/analyzing document: $e');
      final cleanErr = e.toString().replaceAll(RegExp(r'^Exception:\s*'), '');
      setState(() {
        _isLoading = false;
        _error = cleanErr;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Multimodal OCR & Notes',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            InkWell(
              onTap: _isLoading ? null : _pickAndAnalyzeFile,
              borderRadius: BorderRadius.circular(28),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: const Color(0xFFC7D2FE), width: 2),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFF4F46E5).withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: const BoxDecoration(color: Color(0xFFEEF2FF), shape: BoxShape.circle),
                      child: const Icon(Icons.cloud_upload_rounded, color: Color(0xFF4F46E5), size: 36),
                    ),
                    const SizedBox(height: 14),
                    const Text('Upload Textbook Page, Notes or PDF', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    const SizedBox(height: 6),
                    const Text('Supports PDF, PNG, JPG files. Extracts content, generates summaries & questions.', style: TextStyle(fontSize: 12, color: Color(0xFF64748B)), textAlign: TextAlign.center),
                    if (_fileName != null) ...[
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(12)),
                        child: Text(_fileName!, style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            if (_isLoading)
              const Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: Color(0xFF4F46E5)),
                      SizedBox(height: 16),
                      Text('Extracting content with Multimodal AI...', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 15)),
                      SizedBox(height: 6),
                      Text('Generating structured summary & exam questions...', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                    ],
                  ),
                ),
              )
            else if (_error != null)
              Expanded(
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF1F2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFECDD3)),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline_rounded, color: Color(0xFFF43F5E), size: 40),
                        const SizedBox(height: 12),
                        Text(_error!, style: const TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold, fontSize: 14), textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: _pickAndAnalyzeFile,
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), foregroundColor: Colors.white),
                          icon: const Icon(Icons.refresh_rounded, size: 18),
                          label: const Text('Try Again'),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else if (_result != null)
              Expanded(
                child: DefaultTabController(
                  length: 3,
                  child: Column(
                    children: [
                      Container(
                        decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(16)),
                        child: TabBar(
                          indicator: BoxDecoration(color: const Color(0xFF4F46E5), borderRadius: BorderRadius.circular(14)),
                          labelColor: Colors.white,
                          unselectedLabelColor: const Color(0xFF64748B),
                          tabs: const [
                            Tab(text: 'Text Content'),
                            Tab(text: 'AI Summary'),
                            Tab(text: 'Questions'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: TabBarView(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: _result!.extractedText.trim().isNotEmpty
                                  ? SingleChildScrollView(
                                      child: SelectableText(
                                        _result!.extractedText,
                                        style: const TextStyle(
                                          fontSize: 14,
                                          height: 1.6,
                                          color: Color(0xFF0F172A),
                                        ),
                                      ),
                                    )
                                  : const Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(Icons.description_outlined, color: Color(0xFF94A3B8), size: 48),
                                          SizedBox(height: 12),
                                          Text(
                                            'No extractable text found in this document.',
                                            style: TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w500),
                                          ),
                                        ],
                                      ),
                                    ),
                            ),
                            // Tab 2: AI Summary (Generated Lazily On-Demand)
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: _result!.summary.isNotEmpty
                                  ? SingleChildScrollView(
                                      child: MarkdownMathViewer(
                                        data: _result!.summary,
                                        customTextColor: const Color(0xFF0F172A),
                                      ),
                                    )
                                  : Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(Icons.auto_awesome_rounded, color: Color(0xFF4F46E5), size: 48),
                                          const SizedBox(height: 12),
                                          const Text(
                                            'Generate AI Lesson Summary',
                                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                          ),
                                          const SizedBox(height: 6),
                                          const Text(
                                            'Extract key concepts, exam notes, and analogies from this text.',
                                            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                            textAlign: TextAlign.center,
                                          ),
                                          const SizedBox(height: 16),
                                          ElevatedButton.icon(
                                            onPressed: _isGeneratingSummary ? null : _fetchSummary,
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFF4F46E5),
                                              foregroundColor: Colors.white,
                                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                            ),
                                            icon: _isGeneratingSummary
                                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                                : const Icon(Icons.bolt_rounded, size: 18),
                                            label: Text(_isGeneratingSummary ? 'Generating Summary...' : 'Generate AI Summary'),
                                          ),
                                          if (_summaryError != null) ...[
                                            const SizedBox(height: 12),
                                            Text(
                                              _summaryError!,
                                              style: const TextStyle(color: Color(0xFFE11D48), fontSize: 13, fontWeight: FontWeight.w600),
                                              textAlign: TextAlign.center,
                                            ),
                                          ]
                                        ],
                                      ),
                                    ),
                            ),
                            // Tab 3: Questions (Generated Lazily On-Demand)
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: (_result!.mcqs.isNotEmpty || _result!.shortQuestions.isNotEmpty)
                                  ? ListView(
                                      children: [
                                         if (_result!.mcqs.isNotEmpty) ...[
                                           InteractiveQuizWidget(mcqs: _result!.mcqs),
                                         ],
                                        if (_result!.shortQuestions.isNotEmpty) ...[
                                          const SizedBox(height: 16),
                                          const Padding(
                                            padding: EdgeInsets.symmetric(vertical: 8),
                                            child: Text(
                                              'Short & Important Exam Questions',
                                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
                                            ),
                                          ),
                                          ..._result!.shortQuestions.map((q) {
                                            return Card(
                                              margin: const EdgeInsets.only(bottom: 12),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                              child: Padding(
                                                padding: const EdgeInsets.all(16),
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                      decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(8)),
                                                      child: Text(q.markCategory, style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold, fontSize: 11)),
                                                    ),
                                                    const SizedBox(height: 8),
                                                    Text(q.question, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                                                    const SizedBox(height: 6),
                                                    Text('Model Answer: ${q.answer}', style: const TextStyle(fontSize: 13, color: Color(0xFF334155))),
                                                    if (q.markingPoints.isNotEmpty) ...[
                                                      const SizedBox(height: 8),
                                                      const Text('Key Scoring Points:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF64748B))),
                                                      ...q.markingPoints.map((pt) => Padding(
                                                            padding: const EdgeInsets.only(left: 8, top: 2),
                                                            child: Text('• $pt', style: const TextStyle(fontSize: 12, color: Color(0xFF475569))),
                                                          )),
                                                    ],
                                                  ],
                                                ),
                                              ),
                                            );
                                          }),
                                        ],
                                      ],
                                    )
                                  : Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          const Icon(Icons.quiz_rounded, color: Color(0xFF4F46E5), size: 48),
                                          const SizedBox(height: 12),
                                          const Text(
                                            'Generate Practice Quiz & Questions',
                                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                                          ),
                                          const SizedBox(height: 6),
                                          const Text(
                                            'Create 5 MCQs and short exam questions from extracted content.',
                                            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                            textAlign: TextAlign.center,
                                          ),
                                          const SizedBox(height: 16),
                                          ElevatedButton.icon(
                                            onPressed: _isGeneratingQuestions ? null : _fetchQuestions,
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFF4F46E5),
                                              foregroundColor: Colors.white,
                                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                            ),
                                            icon: _isGeneratingQuestions
                                                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                                : const Icon(Icons.psychology_rounded, size: 18),
                                            label: Text(_isGeneratingQuestions ? 'Generating Quiz...' : 'Generate Practice Quiz'),
                                          ),
                                          if (_questionsError != null) ...[
                                            const SizedBox(height: 12),
                                            Text(
                                              _questionsError!,
                                              style: const TextStyle(color: Color(0xFFE11D48), fontSize: 13, fontWeight: FontWeight.w600),
                                              textAlign: TextAlign.center,
                                            ),
                                          ]
                                        ],
                                      ),
                                    ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class InteractiveQuizWidget extends StatefulWidget {
  final List<MCQModel> mcqs;

  const InteractiveQuizWidget({super.key, required this.mcqs});

  @override
  State<InteractiveQuizWidget> createState() => _InteractiveQuizWidgetState();
}

class _InteractiveQuizWidgetState extends State<InteractiveQuizWidget> {
  int _currentIndex = 0;
  final Map<int, int> _selectedAnswers = {};
  bool _isSubmitted = false;

  @override
  Widget build(BuildContext context) {
    if (widget.mcqs.isEmpty) return const SizedBox.shrink();

    if (!_isSubmitted) {
      final q = widget.mcqs[_currentIndex];
      final total = widget.mcqs.length;
      final selectedOpt = _selectedAnswers[_currentIndex];

      return Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Question ${_currentIndex + 1} of $total',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Color(0xFF4F46E5),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF2FF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${_selectedAnswers.length}/$total Answered',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF4F46E5),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: (_currentIndex + 1) / total,
                backgroundColor: const Color(0xFFF1F5F9),
                color: const Color(0xFF4F46E5),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              q.question,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 15,
                color: Color(0xFF0F172A),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            ...q.options.asMap().entries.map((opt) {
              final optIdx = opt.key;
              final optText = opt.value.replaceAll(
                RegExp(r'^(Option\s+[A-D]:?\s*|[A-D]\.\s*)', caseSensitive: false),
                '',
              );
              final isSelected = selectedOpt == optIdx;

              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedAnswers[_currentIndex] = optIdx;
                  });
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFEEF2FF) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isSelected
                            ? Icons.radio_button_checked_rounded
                            : Icons.radio_button_unchecked_rounded,
                        size: 20,
                        color: isSelected
                            ? const Color(0xFF4F46E5)
                            : const Color(0xFF94A3B8),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          '${String.fromCharCode(65 + optIdx)}. $optText',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_currentIndex > 0)
                  OutlinedButton.icon(
                    onPressed: () {
                      setState(() {
                        _currentIndex--;
                      });
                    },
                    icon: const Icon(Icons.arrow_back_rounded, size: 16),
                    label: const Text('Previous'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF0F172A),
                      side: const BorderSide(color: Color(0xFFE2E8F0)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  )
                else
                  const SizedBox.shrink(),
                if (_currentIndex < total - 1)
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _currentIndex++;
                      });
                    },
                    icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                    label: const Text('Next'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  )
                else
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _isSubmitted = true;
                      });
                    },
                    icon: const Icon(Icons.check_circle_rounded, size: 16),
                    label: const Text('Submit Quiz'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
              ],
            ),
          ],
        ),
      );
    }

    // SUBMITTED RESULT AND REVIEW MODE
    int total = widget.mcqs.length;
    int correctCount = 0;
    for (int i = 0; i < total; i++) {
      if (_selectedAnswers[i] == widget.mcqs[i].correctIndex) {
        correctCount++;
      }
    }
    int wrongCount = total - correctCount;
    int percentage = ((correctCount / total) * 100).round();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Score Header Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFFEEF2FF),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFC7D2FE)),
          ),
          child: Column(
            children: [
              const Icon(Icons.emoji_events_rounded, color: Color(0xFF4F46E5), size: 36),
              const SizedBox(height: 6),
              const Text(
                'QUIZ RESULT',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.2, color: Color(0xFF4F46E5)),
              ),
              const SizedBox(height: 6),
              Text(
                'Score: $correctCount / $total',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
              ),
              Text(
                '$percentage% Accuracy',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: percentage >= 70 ? const Color(0xFF10B981) : const Color(0xFFD97706),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFA7F3D0))),
                    child: Text('Correct: $correctCount', style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFFECDD3))),
                    child: Text('Wrong: $wrongCount', style: const TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: () {
                  setState(() {
                    _selectedAnswers.clear();
                    _currentIndex = 0;
                    _isSubmitted = false;
                  });
                },
                icon: const Icon(Icons.refresh_rounded, size: 16),
                label: const Text('Retake Quiz'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF4F46E5),
                  side: const BorderSide(color: Color(0xFF4F46E5)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 4),
          child: Text(
            'Answers Review',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A)),
          ),
        ),
        const SizedBox(height: 6),
        ...widget.mcqs.asMap().entries.map((entry) {
          final idx = entry.key;
          final q = entry.value;
          final userSelected = _selectedAnswers[idx];
          final isCorrect = userSelected == q.correctIndex;

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          'Q${idx + 1}: ${q.question}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isCorrect ? const Color(0xFFECFDF5) : const Color(0xFFFFF1F2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: isCorrect ? const Color(0xFFA7F3D0) : const Color(0xFFFECDD3)),
                        ),
                        child: Text(
                          isCorrect ? '✓ Correct' : '✗ Incorrect',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isCorrect ? const Color(0xFF059669) : const Color(0xFFE11D48),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...q.options.asMap().entries.map((opt) {
                    final optIdx = opt.key;
                    final optText = opt.value.replaceAll(RegExp(r'^(Option\s+[A-D]:?\s*|[A-D]\.\s*)', caseSensitive: false), '');
                    final isUserChoice = userSelected == optIdx;
                    final isRightAnswer = q.correctIndex == optIdx;

                    Color cardBg = const Color(0xFFF8FAFC);
                    Color borderBg = const Color(0xFFE2E8F0);
                    Color textColor = const Color(0xFF0F172A);
                    IconData icon = Icons.radio_button_unchecked_rounded;
                    Color iconColor = const Color(0xFF94A3B8);

                    if (isRightAnswer) {
                      cardBg = const Color(0xFFECFDF5);
                      borderBg = const Color(0xFFA7F3D0);
                      textColor = const Color(0xFF065F46);
                      icon = Icons.check_circle_rounded;
                      iconColor = const Color(0xFF10B981);
                    } else if (isUserChoice && !isCorrect) {
                      cardBg = const Color(0xFFFFF1F2);
                      borderBg = const Color(0xFFFECDD3);
                      textColor = const Color(0xFF9F1239);
                      icon = Icons.cancel_rounded;
                      iconColor = const Color(0xFFF43F5E);
                    }

                    return Container(
                      margin: const EdgeInsets.symmetric(vertical: 3),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: borderBg),
                      ),
                      child: Row(
                        children: [
                          Icon(icon, size: 16, color: iconColor),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${String.fromCharCode(65 + optIdx)}. $optText',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: (isUserChoice || isRightAnswer) ? FontWeight.bold : FontWeight.normal,
                                color: textColor,
                              ),
                            ),
                          ),
                          if (isUserChoice && !isRightAnswer)
                            const Text(' (Your Answer)', style: TextStyle(fontSize: 10, color: Color(0xFFE11D48), fontWeight: FontWeight.bold)),
                          if (isRightAnswer && isUserChoice)
                            const Text(' (Your Answer)', style: TextStyle(fontSize: 10, color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                          if (isRightAnswer && !isUserChoice)
                            const Text(' (Correct Answer)', style: TextStyle(fontSize: 10, color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                        ],
                      ),
                    );
                  }),
                  if (q.explanation.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Explanation: ${q.explanation}',
                        style: const TextStyle(color: Color(0xFF4F46E5), fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}
