import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/authentication/providers/auth_state_provider.dart';
import '../features/authentication/presentation/splash_screen.dart';
import '../features/authentication/presentation/welcome_screen.dart';
import '../features/authentication/presentation/login_screen.dart';
import '../features/authentication/presentation/register_screen.dart';
import '../features/authentication/presentation/forgot_password_screen.dart';
import '../features/authentication/presentation/create_profile_screen.dart';
import '../features/authentication/presentation/grade_selection_screen.dart';
import '../features/dashboard/presentation/dashboard_view.dart';
import '../features/subjects/presentation/subject_list_screen.dart';
import '../features/subjects/presentation/chapter_list_screen.dart';
import '../features/subjects/presentation/lesson_list_screen.dart';
import '../features/subjects/presentation/lesson_reader_screen.dart';
import '../features/subjects/domain/subject_model.dart';
import '../features/subjects/domain/chapter_model.dart';
import '../features/subjects/domain/lesson_model.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

// Listenable wrapper for AuthStateNotifier
class AuthStateListenable extends ValueNotifier<AuthState> {
  AuthStateListenable(super.value);
}

final authListenableProvider = Provider<AuthStateListenable>((ref) {
  final initialAuthState = ref.read(authStateProvider);
  final listenable = AuthStateListenable(initialAuthState);
  ref.listen<AuthState>(authStateProvider, (previous, next) {
    listenable.value = next;
  });
  return listenable;
});

final appRouterProvider = Provider<GoRouter>((ref) {
  final authListenable = ref.watch(authListenableProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: authListenable,
    redirect: (context, state) {
      final authState = authListenable.value;
      debugPrint('DEBUG: GoRouter Redirect evaluated for path: ${state.matchedLocation}, AuthStatus: ${authState.status}');
      final isAuth = authState.status == AuthStateStatus.authenticated || authState.status == AuthStateStatus.guest;
      final isSplash = state.matchedLocation == '/';
      final isWelcome = state.matchedLocation == '/welcome';
      final isLogin = state.matchedLocation == '/login';
      final isRegister = state.matchedLocation == '/register';
      final isForgotPassword = state.matchedLocation == '/forgot-password';
      
      if (authState.status == AuthStateStatus.initial) {
        return '/'; // Stay on splash while loading
      }

      final isGoingToOnboarding = isWelcome || isLogin || isRegister || isForgotPassword;

      if (!isAuth && !isGoingToOnboarding && !isSplash) {
        debugPrint('DEBUG: Navigating to Login');
        return '/welcome';
      }

      if (!isAuth && isSplash) {
        debugPrint('DEBUG: Navigating to Login');
        return '/welcome';
      }

      if (isAuth && (isSplash || isGoingToOnboarding)) {
        // Need to check if profile is complete. For guest, maybe we just go to dashboard or grade selection.
        // For simplicity, we navigate to dashboard, and inside dashboard we can check if profile is complete.
        // Actually, we'll route to dashboard, and later if user needs profile, they go to create_profile.
        // Let's check if the user has a grade. If not, redirect to profile/grade.
        if (authState.user?.displayName == null && !authState.user!.isGuest) {
            return '/create-profile';
        }
        if (authState.user?.grade == null) {
            return '/select-grade';
        }
        debugPrint('DEBUG: Navigating to Dashboard');
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/create-profile',
        builder: (context, state) => const CreateProfileScreen(),
      ),
      GoRoute(
        path: '/select-grade',
        builder: (context, state) => const GradeSelectionScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardView(),
      ),
      GoRoute(
        path: '/subjects',
        builder: (context, state) => const SubjectListScreen(),
      ),
      GoRoute(
        path: '/chapters',
        builder: (context, state) {
          final extras = state.extra as Map<String, dynamic>?;
          return ChapterListScreen(
            classId: extras?['classId'] ?? 'class_6',
            subject: extras?['subject'] as SubjectModel,
          );
        },
      ),
      GoRoute(
        path: '/lessons',
        builder: (context, state) {
          final extras = state.extra as Map<String, dynamic>?;
          return LessonListScreen(
            classId: extras?['classId'] ?? 'class_6',
            subject: extras?['subject'] as SubjectModel,
            chapter: extras?['chapter'] as ChapterModel,
          );
        },
      ),
      GoRoute(
        path: '/lesson_reader',
        builder: (context, state) {
          final lesson = state.extra as LessonModel;
          return LessonReaderScreen(lesson: lesson);
        },
      ),
    ],
  );
});
