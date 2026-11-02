import 'package:flutter_test/flutter_test.dart';
import 'package:smartstudy_mobile/features/subjects/domain/subject_model.dart';
import 'package:smartstudy_mobile/features/authentication/domain/user_model.dart';

void main() {
  group('Subject Progress Calculation & Isolation Tests', () {
    test('Calculates rounded subject progress percentage correctly', () {
      const subject = SubjectModel(
        id: 'maths',
        classId: '8',
        name: 'Mathematics',
        description: 'Maths Grade 8',
        iconUrl: '',
        totalChapters: 4,
        order: 1,
        completedLessonsCount: 1,
      );

      // totalLessons = totalChapters * 3 = 12
      expect(subject.totalLessons, equals(12));
      expect(subject.completedLessons, equals(1));

      final ratio = (subject.completedLessons / subject.totalLessons).clamp(0.0, 1.0);
      final percentage = (ratio * 100).round();

      // 1 / 12 * 100 = 8.333% -> 8%
      expect(percentage, equals(8));
    });

    test('Isolated progress: Grade 6 completion does not affect Grade 8', () {
      final userA = UserModel(
        id: 'user_a',
        studentClass: '8',
        completedLessons: ['g6-maths-c1-l1', 'g6-maths-c1-l2'],
      );

      const subjectG8 = SubjectModel(
        id: 'maths',
        classId: '8',
        name: 'Mathematics',
        description: '',
        iconUrl: '',
        totalChapters: 4,
        order: 1,
      );

      final cleanGrade = subjectG8.classId;
      final countForG8 = userA.completedLessons.where((id) {
        final subKey = subjectG8.id.toLowerCase();
        final isSubjectMatch = id.toLowerCase().contains('-$subKey-') || id.toLowerCase().startsWith('$subKey-');
        final isGradeMatch = id.toLowerCase().contains('g$cleanGrade-') || id.toLowerCase().startsWith('g$cleanGrade-');
        return isSubjectMatch && isGradeMatch;
      }).length;

      expect(countForG8, equals(0));
    });

    test('User isolation: User B does not inherit User A completed lessons', () {
      final userA = UserModel(
        id: 'user_a',
        completedLessons: ['g8-maths-c1-l1'],
      );

      final userB = UserModel(
        id: 'user_b',
        completedLessons: [],
      );

      expect(userA.completedLessons.length, equals(1));
      expect(userB.completedLessons.length, equals(0));
    });
  });
}
