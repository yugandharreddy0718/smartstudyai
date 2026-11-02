import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/progress_repository.dart';
import '../domain/lesson_progress_model.dart';
import '../data/firebase_progress_data_source.dart';
import '../../authentication/providers/auth_state_provider.dart';
import '../../authentication/domain/user_model.dart';
import 'curriculum_provider.dart';
import '../../dashboard/providers/dashboard_provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:async';

final progressRepositoryProvider = Provider<ProgressRepository>((ref) {
  return FirebaseProgressDataSource(ref.read(firestoreProvider));
});

final lessonProgressProvider = FutureProvider.family<LessonProgressModel?, String>((ref, lessonId) async {
  final repo = ref.read(progressRepositoryProvider);
  final user = FirebaseAuth.instance.currentUser;
  if (user == null) return null;
  return repo.getLessonProgress(user.uid, lessonId);
});

class LessonProgressNotifier extends AsyncNotifier<void> {
  late final ProgressRepository _repository;

  @override
  FutureOr<void> build() {
    _repository = ref.read(progressRepositoryProvider);
  }

  Future<void> saveProgress(String lessonId, double scrollPosition, int readingTimeSeconds) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    
    try {
      final progress = LessonProgressModel(
        id: lessonId,
        lessonId: lessonId,
        isCompleted: false, 
        scrollPosition: scrollPosition,
        readingTimeSeconds: readingTimeSeconds,
        lastRead: DateTime.now(),
      );
      await _repository.saveLessonProgress(user.uid, progress);
    } catch (e) {
      // Handle error gracefully
    }
  }

  Future<void> markComplete(String lessonId) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    
    state = const AsyncValue.loading();
    try {
      await _repository.markLessonComplete(user.uid, lessonId);

      try {
        final userDoc = await ref.read(firestoreProvider).collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data() != null) {
          final data = userDoc.data()!;
          data['id'] = user.uid;
          data['uid'] = user.uid;
          final updatedUser = UserModel.fromJson(data);
          ref.read(authStateProvider.notifier).setAuthenticated(updatedUser);
          await ref.read(authLocalDataSourceProvider).saveUser(updatedUser);
        }
      } catch (e) {
        final activeUser = ref.read(authStateProvider).user;
        if (activeUser != null) {
          final currentCompleted = List<String>.from(activeUser.completedLessons);
          if (!currentCompleted.contains(lessonId)) {
            currentCompleted.add(lessonId);
            final updatedUser = activeUser.copyWith(completedLessons: currentCompleted);
            ref.read(authStateProvider.notifier).setAuthenticated(updatedUser);
            await ref.read(authLocalDataSourceProvider).saveUser(updatedUser);
          }
        }
      }

      ref.invalidate(subjectsProvider);
      ref.invalidate(dashboardProvider);
      ref.invalidate(lessonProgressProvider(lessonId));
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> markUncomplete(String lessonId) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    
    state = const AsyncValue.loading();
    try {
      await _repository.markLessonUncomplete(user.uid, lessonId);

      try {
        final userDoc = await ref.read(firestoreProvider).collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data() != null) {
          final data = userDoc.data()!;
          data['id'] = user.uid;
          data['uid'] = user.uid;
          final updatedUser = UserModel.fromJson(data);
          ref.read(authStateProvider.notifier).setAuthenticated(updatedUser);
          await ref.read(authLocalDataSourceProvider).saveUser(updatedUser);
        }
      } catch (e) {
        final activeUser = ref.read(authStateProvider).user;
        if (activeUser != null) {
          final currentCompleted = List<String>.from(activeUser.completedLessons);
          currentCompleted.remove(lessonId);
          final updatedUser = activeUser.copyWith(completedLessons: currentCompleted);
          ref.read(authStateProvider.notifier).setAuthenticated(updatedUser);
          await ref.read(authLocalDataSourceProvider).saveUser(updatedUser);
        }
      }

      ref.invalidate(subjectsProvider);
      ref.invalidate(dashboardProvider);
      ref.invalidate(lessonProgressProvider(lessonId));
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> toggleComplete(String lessonId, bool isCurrentlyCompleted) async {
    if (isCurrentlyCompleted) {
      await markUncomplete(lessonId);
    } else {
      await markComplete(lessonId);
    }
  }
}

final lessonProgressNotifierProvider = AsyncNotifierProvider<LessonProgressNotifier, void>(
  LessonProgressNotifier.new,
);
