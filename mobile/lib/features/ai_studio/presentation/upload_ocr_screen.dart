import 'dart:convert';
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
  String? _fileName;
  MultimodalResultModel? _result;
  String? _error;

  Future<void> _pickAndAnalyzeFile() async {
    try {
      final files = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
      );

      if (files.isNotEmpty) {
        final file = files.first;
        setState(() {
          _fileName = file.name;
          _isLoading = true;
          _error = null;
        });

        String base64Content = '';
        final fileBytes = await file.readAsBytes();
        if (fileBytes.isNotEmpty) {
          base64Content = base64Encode(fileBytes);
        }

        final res = await AIService.analyzeDocument(
          fileBase64: base64Content,
          fileName: file.name,
        );

        setState(() {
          _result = res;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to process file: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Document Upload & OCR Studio'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Icon(Icons.cloud_upload, size: 48, color: Colors.indigo),
                    const SizedBox(height: 12),
                    Text(
                      'Upload Study Notes or PDF',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    const Text('Supported formats: PDF, PNG, JPG', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _isLoading ? null : _pickAndAnalyzeFile,
                      icon: const Icon(Icons.attach_file),
                      label: Text(_fileName != null ? 'Change File ($_fileName)' : 'Select Document'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Analyzing document with Multimodal OCR & AI...'),
                    ],
                  ),
                ),
              )
            else if (_error != null)
              Expanded(
                child: Center(
                  child: Text(_error!, style: const TextStyle(color: Colors.red)),
                ),
              )
            else if (_result != null)
              Expanded(
                child: DefaultTabController(
                  length: 3,
                  child: Column(
                    children: [
                      const TabBar(
                        tabs: [
                          Tab(text: 'Extracted OCR'),
                          Tab(text: 'AI Summary'),
                          Tab(text: 'Quiz Questions'),
                        ],
                      ),
                      Expanded(
                        child: TabBarView(
                          children: [
                            SingleChildScrollView(
                              padding: const EdgeInsets.all(16),
                              child: SelectableText(_result!.extractedText),
                            ),
                            SingleChildScrollView(
                              padding: const EdgeInsets.all(16),
                              child: MarkdownMathViewer(data: _result!.summary),
                            ),
                            ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _result!.questions.length,
                              itemBuilder: (context, idx) {
                                final q = _result!.questions[idx];
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  child: ListTile(
                                    title: Text(q.question),
                                    subtitle: Text('Correct Answer: \${q.options[q.correctIndex]}'),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              const Expanded(
                child: Center(
                  child: Text('Select a document to extract OCR text and generate AI summaries.'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
