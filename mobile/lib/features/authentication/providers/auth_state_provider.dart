import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../data/auth_local_data_source.dart';
import '../data/auth_remote_data_source.dart';
import '../domain/auth_repository.dart';
import '../repository/auth_repository_impl.dart';
import '../domain/user_model.dart';
import 'package:flutter/foundation.dart';
import '../../../core/api/api_client.dart';

// Providers for dependencies
final dioProvider = Provider<Dio>((ref) => ApiClient().dio);
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) => FirebaseAuth.instance);
final firestoreProvider = Provider<FirebaseFirestore>((ref) => FirebaseFirestore.instanceFor(app: Firebase.app(), databaseId: 'ai-studio-2bce6e12-8e86-497d-9a6c-372bf2ee28e4'));
final googleSignInProvider = Provider<GoogleSignIn>((ref) => GoogleSignIn.instance);
final authLocalDataSourceProvider = Provider<AuthLocalDataSource>((ref) {
  return AuthLocalDataSourceImpl();
});

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSourceImpl(
    dio: ref.watch(dioProvider),
    firebaseAuth: ref.watch(firebaseAuthProvider),
    firestore: ref.watch(firestoreProvider),
    googleSignIn: ref.watch(googleSignInProvider),
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    localDataSource: ref.watch(authLocalDataSourceProvider),
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
    firestore: ref.watch(firestoreProvider),
  );
});

// Auth State Provider
enum AuthStateStatus { initial, unauthenticated, authenticated, guest }

class AuthState {
  final AuthStateStatus status;
  final UserModel? user;
  
  AuthState({required this.status, this.user});
  
  factory AuthState.initial() => AuthState(status: AuthStateStatus.initial);
  factory AuthState.unauthenticated() => AuthState(status: AuthStateStatus.unauthenticated);
  factory AuthState.authenticated(UserModel user) => AuthState(status: AuthStateStatus.authenticated, user: user);
  factory AuthState.guest(UserModel user) => AuthState(status: AuthStateStatus.guest, user: user);
}

class AuthStateNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _checkAuthState();
    return AuthState.initial();
  }
  
  Future<void> _checkAuthState() async {
    debugPrint('DEBUG: Auth Initialized');
    final cachedUser = await ref.read(authRepositoryProvider).getCachedUser();
    if (cachedUser != null) {
      debugPrint('DEBUG: Current User Loaded: ${cachedUser.email}');
      if (cachedUser.isGuest) {
        state = AuthState.guest(cachedUser);
      } else {
        state = AuthState.authenticated(cachedUser);
      }
    } else {
      debugPrint('DEBUG: No Current User (Unauthenticated)');
      state = AuthState.unauthenticated();
    }
    debugPrint('DEBUG: Auth State Loaded');
  }

  void setAuthenticated(UserModel user) {
    if (user.isGuest) {
      state = AuthState.guest(user);
    } else {
      state = AuthState.authenticated(user);
    }
  }

  void setUnauthenticated() {
    state = AuthState.unauthenticated();
  }
}

final authStateProvider = NotifierProvider<AuthStateNotifier, AuthState>(() {
  return AuthStateNotifier();
});
