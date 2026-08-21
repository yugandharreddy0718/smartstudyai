import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

abstract class AuthRemoteDataSource {
  Future<UserCredential> registerWithEmail(String email, String password);
  Future<UserCredential> loginWithEmail(String email, String password);
  Future<void> resetPassword(String email);
  Future<UserCredential> signInWithGoogle();
  Future<UserCredential> signInAsGuest();
  Future<void> logout();
  Future<void> updateProfile({required String uid, String? name, String? grade, String? studentClass});
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;
  final FirebaseAuth firebaseAuth;
  final FirebaseFirestore firestore;
  final GoogleSignIn googleSignIn;

  AuthRemoteDataSourceImpl({
    required this.dio,
    required this.firebaseAuth,
    required this.firestore,
    required this.googleSignIn,
  });

  @override
  Future<UserCredential> registerWithEmail(String email, String password) async {
    try {
      return await firebaseAuth.createUserWithEmailAndPassword(email: email, password: password);
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }

  @override
  Future<UserCredential> loginWithEmail(String email, String password) async {
    try {
      return await firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }

  @override
  Future<void> resetPassword(String email) async {
    try {
      await firebaseAuth.sendPasswordResetEmail(email: email);
    } catch (e) {
      throw Exception('Password reset failed: $e');
    }
  }

  @override
  Future<UserCredential> signInWithGoogle() async {
    try {
      final GoogleSignInAccount googleUser = await googleSignIn.authenticate();
      final GoogleSignInAuthentication googleAuth = googleUser.authentication;
      final authz = await googleUser.authorizationClient.authorizeScopes(['email']);
      
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: authz.accessToken,
        idToken: googleAuth.idToken,
      );
      return await firebaseAuth.signInWithCredential(credential);
    } catch (e) {
      throw Exception('Google Sign In failed: $e');
    }
  }

  @override
  Future<UserCredential> signInAsGuest() async {
    try {
      return await firebaseAuth.signInAnonymously();
    } catch (e) {
      throw Exception('Guest Sign In failed: $e');
    }
  }

  @override
  Future<void> logout() async {
    try {
      await googleSignIn.signOut();
    } catch (e) {
      debugPrint('DEBUG: Error during googleSignIn.signOut: $e');
    }
    await firebaseAuth.signOut();
  }
  
  @override
  Future<void> updateProfile({required String uid, String? name, String? grade, String? studentClass}) async {
    final Map<String, dynamic> data = {};
    final activeClass = (studentClass ?? grade ?? '8').replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');
    
    if (name != null) {
      data['displayName'] = name;
      data['name'] = name; // Legacy mirror
    }
    data['studentClass'] = activeClass;
    data['grade'] = activeClass; // Legacy mirror
    data['updatedAt'] = DateTime.now().millisecondsSinceEpoch;
    
    await firestore.collection('users').doc(uid).set(data, SetOptions(merge: true));
  }
}

