import 'package:flutter/material.dart';

class PDFViewerScreen extends StatefulWidget {
  final String title;
  final String? pdfUrl;

  const PDFViewerScreen({
    super.key,
    required this.title,
    this.pdfUrl,
  });

  @override
  State<PDFViewerScreen> createState() => _PDFViewerScreenState();
}

class _PDFViewerScreenState extends State<PDFViewerScreen> {
  int _currentPage = 1;
  final int _totalPages = 12;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          widget.title,
          style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_rounded, color: Color(0xFF4F46E5)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Document link copied to clipboard.')),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Page $_currentPage of $_totalPages',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.navigate_before_rounded),
                      onPressed: _currentPage > 1
                          ? () {
                              setState(() {
                                _currentPage--;
                              });
                            }
                          : null,
                    ),
                    IconButton(
                      icon: const Icon(Icons.navigate_next_rounded),
                      onPressed: _currentPage < _totalPages
                          ? () {
                              setState(() {
                                _currentPage++;
                              });
                            }
                          : null,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 15, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${widget.title} — Page $_currentPage',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const Divider(height: 32, color: Color(0xFFF1F5F9)),
                    Text(
                      'This document reader renders standard NCERT textbook notes, board exam guides, and reference materials.\n\n'
                      'Page $_currentPage Content Summary:\n'
                      '• Comprehensive theoretical breakdown\n'
                      '• Key formulas, step-by-step examples, and solution keys\n'
                      '• Practice problem set for board exam preparation',
                      style: const TextStyle(fontSize: 14, color: Color(0xFF334155), height: 1.6),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
