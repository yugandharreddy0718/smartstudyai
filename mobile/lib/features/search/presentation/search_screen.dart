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
              if (matches.length >= 40) break; // Limit search results
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
      appBar: AppBar(
        title: TextField(
          controller: _queryController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search 444 lessons, 178 chapters...',
            border: InputBorder.none,
          ),
          onChanged: (val) => _performSearch(val),
        ),
        actions: [
          if (_queryController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _queryController.clear();
                _performSearch('');
              },
            ),
        ],
      ),
      body: _isSearching
          ? const Center(child: CircularProgressIndicator())
          : _queryController.text.trim().isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text('Search SmartStudy AI Curriculum', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        SizedBox(height: 8),
                        Text('Type any concept, equation, chapter title, or subject name to search across Classes 6 to 10.', textAlign: TextAlign.center),
                      ],
                    ),
                  ),
                )
              : _results.isEmpty
                  ? const Center(child: Text('No matching lessons found.'))
                  : ListView.builder(
                      itemCount: _results.length,
                      itemBuilder: (context, idx) {
                        final item = _results[idx];
                        return ListTile(
                          leading: CircleAvatar(
                            child: Text('Class ${item.grade}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                          title: Text(item.lesson.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('Class ${item.grade} • ${item.subject.name} • ${item.chapter.title}'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            context.push(
                              '/lesson/\${item.lesson.id}',
                              extra: item.lesson,
                            );
                          },
                        );
                      },
                    ),
    );
  }
}
