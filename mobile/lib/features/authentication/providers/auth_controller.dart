import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_state_provider.dart';

class AuthController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() {
    return const AsyncData(null);
  }

  Future<void> registerWithEmail(String email, String password, String name, String grade) async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.registerWithEmail(email, password, name, grade);
      ref.read(authStateProvider.notifier).setAuthenticated(user);
      state = const AsyncData(null);
    } catch (e, st) {
      debugPrint('DEBUG: Error in registerWithEmail: $e');
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> loginWithEmail(String email, String password) async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.loginWithEmail(email, password);
      ref.read(authStateProvider.notifier).setAuthenticated(user);
      state = const AsyncData(null);
    } catch (e, st) {
      debugPrint('DEBUG: Error in loginWithEmail: $e');
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> resetPassword(String email) async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.resetPassword(email);
      state = const AsyncData(null);
    } catch (e, st) {
      debugPrint('DEBUG: Error in resetPassword: $e');
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> signInWithGoogle() async {
    debugPrint('DEBUG: Google Sign-In Started');
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.signInWithGoogle();
      debugPrint('DEBUG: Google Sign-In Success');
      ref.read(authStateProvider.notifier).setAuthenticated(user);
      state = const AsyncData(null);
    } catch (e, st) {
      if (e.toString().contains('canceled')) {
        debugPrint('DEBUG: Google Sign-In was cancelled by the user or Play Services.');
      } else {
        debugPrint('DEBUG: Error in signInWithGoogle: $e');
      }
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> signInAsGuest() async {
    debugPrint('DEBUG: Guest Login Started');
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.signInAsGuest();
      debugPrint('DEBUG: Guest Login Success');
      ref.read(authStateProvider.notifier).setAuthenticated(user);
      state = const AsyncData(null);
    } catch (e, st) {
      debugPrint('DEBUG: Error in signInAsGuest: $e');
      state = AsyncError(e, st);
      rethrow;
    }
  }

  Future<void> logout() async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.logout();
      ref.read(authStateProvider.notifier).setUnauthenticated();
      state = const AsyncData(null);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }
  
  Future<void> updateProfile({required String uid, String? name, String? grade, String? studentClass}) async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.updateProfile(uid: uid, name: name, grade: grade, studentClass: studentClass);
      
      // Update local auth state with new user info
      final cachedUser = await repository.getCachedUser();
      if (cachedUser != null) {
        ref.read(authStateProvider.notifier).setAuthenticated(cachedUser);
      }
      
      state = const AsyncData(null);
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }
}

final authControllerProvider = NotifierProvider<AuthController, AsyncValue<void>>(() {
  return AuthController();
});
