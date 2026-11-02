import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../subjects/data/local_curriculum_data_source.dart';
import '../../subjects/domain/subject_model.dart';
import '../../subjects/domain/chapter_model.dart';
import '../../subjects/domain/lesson_model.dart';

class SearchResultItem {
  final String grade;
  final SubjectModel subject;
  final ChapterModel chapter;
  final LessonModel lesson;

  SearchResultItem({
    required this.grade,
    required this.subject,
    required this.chapter,
    required this.lesson,
  });
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _queryController = TextEditingController();
  final LocalCurriculumDataSource _localCurriculum = LocalCurriculumDataSource();
  List<SearchResultItem> _results = [];
  bool _isSearching = false;

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  Future<void> _performSearch(String query) async {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) {
      setState(() {
        _results = [];
        _isSearching = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
    });

    final List<SearchResultItem> matches = [];
    final grades = ['6', '7', '8', '9', '10'];

    for (var grade in grades) {
      final subjects = await _localCurriculum.getSubjects(grade);
      for (var subject in subjects) {
        final chapters = await _localCurriculum.getChapters(grade, subject.id);
        for (var chapter in chapters) {
          final lessons = await _localCurriculum.getLessons(grade, subject.id, chapter.id);
          for (var lesson in lessons) {
            if (lesson.title.toLowerCase().contains(q) ||
                chapter.title.toLowerCase().contains(q) ||
                subject.name.toLowerCase().contains(q) ||
                lesson.id.toLowerCase().contains(q)) {
              matches.add(SearchResultItem(
                grade: grade,
                subject: subject,
                chapter: chapter,
                lesson: lesson,
              ));
              if (matches.length >= 40) break;
            }
          }
          if (matches.length >= 40) break;
        }
        if (matches.length >= 40) break;
      }
      if (matches.length >= 40) break;
    }

    setState(() {
      _results = matches;
      _isSearching = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: () => context.pop(),
        ),
        title: TextField(
          controller: _queryController,
          autofocus: true,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
          decoration: const InputDecoration(
            hintText: 'Search 444 lessons, 178 chapters...',
            hintStyle: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.normal),
            border: InputBorder.none,
          ),
          onChanged: (val) => _performSearch(val),
        ),
        actions: [
          if (_queryController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear_rounded, color: Color(0xFF94A3B8)),
              onPressed: () {
                _queryController.clear();
                _performSearch('');
              },
            ),
        ],
      ),
      body: _isSearching
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5)))
          : _queryController.text.trim().isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.search_rounded, size: 64, color: Color(0xFFCBD5E1)),
                        SizedBox(height: 16),
                        Text(
                          'Search SmartStudy AI Curriculum',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF0F172A)),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Type any concept, equation, chapter title, or subject name to search across Classes 6 to 10.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
                        ),
                      ],
                    ),
                  ),
                )
              : _results.isEmpty
                  ? Center(
                      child: Text(
                        'No matching lessons found for "${_queryController.text}".',
                        style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _results.length,
                      itemBuilder: (context, idx) {
                        final item = _results[idx];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFF1F5F9)),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            leading: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEEF2FF),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'G${item.grade}',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF4F46E5)),
                              ),
                            ),
                            title: Text(
                              item.lesson.title,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                            ),
                            subtitle: Text(
                              'Grade ${item.grade} • ${item.subject.name} • ${item.chapter.title}',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                            trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFFCBD5E1)),
                            onTap: () {
                              context.push('/lesson_reader', extra: item.lesson);
                            },
                          ),
                        );
                      },
                    ),
    );
  }
}
