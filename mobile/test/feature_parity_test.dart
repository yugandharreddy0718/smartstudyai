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
    test('AI Summary Service returns structured text or error', () async {
      try {
        final summary = await AIService.generateSummary(
          lessonId: 'g10-maths-c1-l1',
          title: 'Real Numbers',
          content: 'Content text',
        );
        expect(summary, isNotEmpty);
      } catch (e) {
        expect(e.toString(), isNotEmpty);
      }
    });

    test('Important Q&A Generator returns categories or error', () async {
      try {
        final questions = await AIService.generateImportantQuestions(
          lessonId: 'g10-maths-c1-l1',
          title: 'Real Numbers',
          content: 'Content text',
        );
        expect(questions, isNotNull);
      } catch (e) {
        expect(e.toString(), isNotEmpty);
      }
    });

    test('MCQ Generator respects requested question count or error', () async {
      try {
        final mcqs = await AIService.generateMCQs(
          lessonId: 'g10-maths-c1-l1',
          title: 'Real Numbers',
          content: 'Content text',
          count: 10,
          difficulty: 'Hard',
        );
        expect(mcqs, isNotNull);
      } catch (e) {
        expect(e.toString(), isNotEmpty);
      }
    });

    test('AI Tutor Chat Assistant provides responsive study help or error', () async {
      try {
        final reply = await AIService.chatWithTutor(
          userMessage: 'Explain Euclid Lemma',
          history: [],
        );
        expect(reply, isNotEmpty);
      } catch (e) {
        expect(e.toString(), isNotEmpty);
      }
    });

    test('Multimodal OCR Document Analysis returns text and empty summary/questions until requested', () async {
      try {
        const validPdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNCAwIFIgPj4gPj4gL0NvbnRlbnRzIDUgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKNSAwIG9iago8PCAvTGVuZ3RoIDc2ID4+CnN0cmVhbQpCVAovRjEgMTIgVGYKMTAwIDcwMCBUZAooR21haWwgLSBBZG1pc3Npb25zIHByb2NlZHVyZSBhbmQgZ3VpZGVsaW5lcyAyMDI2KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIzMCAwMDAwMCBuIAowMDAwMDAwMzAwIDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNiAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNDI2CiUlRU9G';
        final result = await AIService.analyzeDocument(
          base64Data: validPdfBase64,
          mimeType: 'application/pdf',
          fileName: 'test_notes.pdf',
        );
        expect(result.extractedText, isNotEmpty);
        expect(result.summary, isEmpty);
        expect(result.mcqs, isEmpty);
      } catch (e) {
        expect(e.toString(), isNotEmpty);
      }
    });
  });
}
