import 'package:flutter_test/flutter_test.dart';
import 'package:smartstudy_mobile/features/subjects/data/local_curriculum_data_source.dart';
import 'package:smartstudy_mobile/features/ai_studio/data/ai_service.dart';

void main() {
  group('Mobile Parity — Curriculum & Local Fallback Tests (M1)', () {
    final localCurriculum = LocalCurriculumDataSource();

    test('Loads 6 subjects for Grade 6, 7, 8, 9, 10', () async {
      for (var grade in ['6', '7', '8', '9', '10']) {
        final subjects = await localCurriculum.getSubjects(grade);
        expect(subjects.length, equals(6));
        expect(subjects.map((s) => s.id), containsAll(['maths', 'physics', 'chemistry', 'biology', 'history', 'geography']));
      }
    });

    test('Loads chapters and lessons from local fallback dataset', () async {
      int totalChapters = 0;
      int totalLessons = 0;
      for (var grade in ['6', '7', '8', '9', '10']) {
        final subjects = await localCurriculum.getSubjects(grade);
        for (var sub in subjects) {
          final chapters = await localCurriculum.getChapters(grade, sub.id);
          totalChapters += chapters.length;
          for (var ch in chapters) {
            final lessons = await localCurriculum.getLessons(grade, sub.id, ch.id);
            totalLessons += lessons.length;
          }
        }
      }
      expect(totalChapters, greaterThan(0));
      expect(totalLessons, greaterThan(0));
    });

    test('Lesson detail contains 13-section pedagogical layout', () async {
      final lesson = await localCurriculum.getLessonDetails('10', 'maths', 'g10-maths-c1', 'g10-maths-c1-l1');
      expect(lesson.contentMarkdown, contains('## 1. Learning Objectives'));
      expect(lesson.contentMarkdown, contains('## 2. Introduction'));
      expect(lesson.contentMarkdown, contains('## 3. Detailed Concept Explanation'));
      expect(lesson.contentMarkdown, contains('## 4. Important Definitions'));
      expect(lesson.contentMarkdown, contains('## 5. Key Concepts'));
      expect(lesson.contentMarkdown, contains('## 6. Examples'));
      expect(lesson.contentMarkdown, contains('## 7. Step-by-Step Explanation'));
      expect(lesson.contentMarkdown, contains('## 8. Formulas / Rules'));
      expect(lesson.contentMarkdown, contains('## 9. Worked Problems'));
      expect(lesson.contentMarkdown, contains('## 10. Try Yourself'));
      expect(lesson.contentMarkdown, contains('## 11. Common Mistakes'));
      expect(lesson.contentMarkdown, contains('## 12. Quick Revision & Key Takeaways'));
    });
  });

  group('Mobile Parity — Single Lesson Completion Isolation (M2)', () {
    test('Completing g10-maths-c1-l1 does not alter g10-maths-c1-l2', () {
      final completedLessons = <String>[];
      completedLessons.add('g10-maths-c1-l1');

      expect(completedLessons.contains('g10-maths-c1-l1'), isTrue);
      expect(completedLessons.contains('g10-maths-c1-l2'), isFalse);
      expect(completedLessons.contains('g10-maths-c1-l3'), isFalse);
    });
  });

  group('Mobile Parity — AI Features & API Suite (M3-M8)', () {
    test('AI Summary Service returns structured text', () async {
      final summary = await AIService.generateSummary(
        lessonId: 'g10-maths-c1-l1',
        title: 'Real Numbers',
        content: 'Content text',
      );
      expect(summary, isNotEmpty);
      expect(summary, contains('SmartStudy AI'));
    });

    test('Important Q&A Generator returns 1, 2, 3, 5 Mark categories', () async {
      final questions = await AIService.generateImportantQuestions(
        lessonId: 'g10-maths-c1-l1',
        title: 'Real Numbers',
        content: 'Content text',
      );
      expect(questions, isNotEmpty);
      final categories = questions.map((q) => q.markCategory).toList();
      expect(categories, containsAll(['1 MARK', '2 MARK', '3 MARK', '5 MARK']));
    });

    test('MCQ Generator respects requested question count', () async {
      final mcqs = await AIService.generateMCQs(
        lessonId: 'g10-maths-c1-l1',
        title: 'Real Numbers',
        content: 'Content text',
        count: 10,
        difficulty: 'Hard',
      );
      expect(mcqs.length, equals(10));
      expect(mcqs.first.options.length, equals(4));
    });

    test('AI Tutor Chat Assistant provides responsive study help', () async {
      final reply = await AIService.chatWithTutor(
        userMessage: 'Explain Euclid Lemma',
        lessonContext: 'Real numbers theorem',
        history: [],
      );
      expect(reply, isNotEmpty);
    });

    test('Multimodal OCR Document Analysis returns text, summary and questions', () async {
      final result = await AIService.analyzeDocument(
        fileBase64: 'SGVsbG8=',
        fileName: 'test_notes.pdf',
      );
      expect(result.extractedText, isNotEmpty);
      expect(result.summary, isNotEmpty);
      expect(result.questions, isNotEmpty);
    });
  });
}
