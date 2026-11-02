import 'package:flutter_test/flutter_test.dart';
import 'package:smartstudy_mobile/features/authentication/domain/user_model.dart';
import 'package:smartstudy_mobile/features/subjects/domain/curriculum_repository.dart';
import 'package:smartstudy_mobile/features/subjects/data/local_curriculum_data_source.dart';
import 'package:smartstudy_mobile/features/subjects/domain/book_model.dart';
import 'package:smartstudy_mobile/features/subjects/domain/subject_model.dart';

void main() {
  group('Admin & Role Parity Tests', () {
    test('UserModel role getters evaluate case-insensitively', () {
      final superAdminUser = UserModel(
        id: 'super_1',
        email: 'superadmin@smartstudy.ai',
        role: 'superAdmin',
      );
      expect(superAdminUser.isAdmin, isTrue);
      expect(superAdminUser.isSuperAdmin, isTrue);
      expect(superAdminUser.isStudent, isFalse);

      final adminUserUpper = UserModel(
        id: 'admin_1',
        email: 'admin@smartstudy.ai',
        role: 'ADMIN',
      );
      expect(adminUserUpper.isAdmin, isTrue);
      expect(adminUserUpper.isSuperAdmin, isFalse);
      expect(adminUserUpper.isStudent, isFalse);

      final studentUser = UserModel(
        id: 'student_1',
        email: 'student@smartstudy.ai',
        role: 'student',
      );
      expect(studentUser.isAdmin, isFalse);
      expect(studentUser.isSuperAdmin, isFalse);
      expect(studentUser.isStudent, isTrue);

      final studentMixedCase = UserModel(
        id: 'student_2',
        email: 'student2@smartstudy.ai',
        role: 'Student',
      );
      expect(studentMixedCase.isAdmin, isFalse);
      expect(studentMixedCase.isStudent, isTrue);
    });

    test('LocalCurriculumDataSource implements CurriculumRepository with getBooks', () async {
      final CurriculumRepository repo = LocalCurriculumDataSource();
      final books = await repo.getBooks('class_8');
      expect(books, isEmpty);

      final subjects = await repo.getSubjects('8');
      expect(subjects.length, equals(6));
    });

    test('BookModel serialization and deserialization', () {
      final map = {
        'id': 'book-1',
        'title': 'NCERT Mathematics Class 8',
        'classId': 'class_8',
        'subjectId': 'maths',
        'description': 'Full NCERT textbook PDF',
        'pdfUrl': 'https://firebasestorage.googleapis.com/.../maths.pdf',
        'fileSizeBytes': 15000000,
        'fileName': 'maths.pdf',
        'status': 'published',
      };

      final book = BookModel.fromMap(map, 'book-1');
      expect(book.title, equals('NCERT Mathematics Class 8'));
      expect(book.fileSizeBytes, equals(15000000));
      expect(book.status, equals('published'));

      final serialized = book.toMap();
      expect(serialized['classId'], equals('class_8'));
    });

    test('SubjectModel correctly parses iconUrl and icon fallback', () {
      final withIcon = {
        'classId': 'class_8',
        'name': 'Science',
        'description': 'Integrated Science',
        'icon': '🔬',
        'totalChapters': 18,
        'order': 2,
      };

      final subject = SubjectModel.fromMap(withIcon, 'science');
      expect(subject.name, equals('Science'));
      expect(subject.iconUrl, equals('🔬'));
      expect(subject.totalChapters, equals(18));
    });
  });
}

