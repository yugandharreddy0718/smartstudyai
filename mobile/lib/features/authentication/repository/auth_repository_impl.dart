import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../data/auth_local_data_source.dart';
import '../data/auth_remote_data_source.dart';
import '../domain/auth_repository.dart';
import '../domain/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthLocalDataSource localDataSource;
  final AuthRemoteDataSource remoteDataSource;
  final FirebaseFirestore firestore;

  AuthRepositoryImpl({
    required this.localDataSource,
    required this.remoteDataSource,
    required this.firestore,
  });

  Future<UserModel> _initUserProfile(UserCredential credential, {String? name, String? grade}) async {
    final user = credential.user!;
    final docRef = firestore.collection('users').doc(user.uid);
    final docSnap = await docRef.get();

    final cleanGrade = (grade ?? '8').replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');

    if (!docSnap.exists) {
      await docRef.set({
        'uid': user.uid,
        'id': user.uid,
        'displayName': name ?? user.displayName ?? user.email?.split('@')[0] ?? 'Student',
        'name': name ?? user.displayName ?? user.email?.split('@')[0] ?? 'Student',
        'email': user.email ?? '',
        'studentClass': cleanGrade,
        'grade': cleanGrade,
        'photoURL': user.photoURL ?? '',
        'photoUrl': user.photoURL ?? '',
        'role': 'student',
        'provider': user.isAnonymous ? 'anonymous' : (user.providerData.isNotEmpty ? user.providerData[0].providerId : 'password'),
        'stats': {
          'xp': 0,
          'level': 1,
          'streak': 0,
        },
        'xp': 0,
        'level': 1,
        'streak': 0,
        'completedLessons': <String>[],
        'createdAt': DateTime.now().millisecondsSinceEpoch,
        'updatedAt': DateTime.now().millisecondsSinceEpoch,
      });
    } else {
      await docRef.set({'updatedAt': DateTime.now().millisecondsSinceEpoch}, SetOptions(merge: true));
    }

    final updatedSnap = await docRef.get();
    final data = updatedSnap.data() ?? {};
    data['uid'] = user.uid;
    data['id'] = user.uid;
    data['isGuest'] = user.isAnonymous;

    final userModel = UserModel.fromJson(data);
    await localDataSource.saveUser(userModel);
    return userModel;
  }

  @override
  Future<UserModel> registerWithEmail(String email, String password, String name, String grade) async {
    final credential = await remoteDataSource.registerWithEmail(email, password);
    return await _initUserProfile(credential, name: name, grade: grade);
  }

  @override
  Future<UserModel> loginWithEmail(String email, String password) async {
    final credential = await remoteDataSource.loginWithEmail(email, password);
    return await _initUserProfile(credential);
  }

  @override
  Future<void> resetPassword(String email) async {
    await remoteDataSource.resetPassword(email);
  }

  @override
  Future<UserModel> signInWithGoogle() async {
    final credential = await remoteDataSource.signInWithGoogle();
    return await _initUserProfile(credential);
  }

  @override
  Future<UserModel> signInAsGuest() async {
    final credential = await remoteDataSource.signInAsGuest();
    return await _initUserProfile(credential);
  }

  @override
  Future<void> logout() async {
    await remoteDataSource.logout();
    await localDataSource.clearUser();
  }

  @override
  Future<UserModel?> getCachedUser() async {
    return await localDataSource.getUser();
  }
  
  @override
  Future<void> updateProfile({required String uid, String? name, String? grade, String? studentClass}) async {
    await remoteDataSource.updateProfile(uid: uid, name: name, grade: grade, studentClass: studentClass);
    
    // Update local cache
    final currentUser = await localDataSource.getUser();
    if (currentUser != null && currentUser.id == uid) {
      final updatedUser = currentUser.copyWith(
        displayName: name ?? currentUser.displayName,
        studentClass: studentClass ?? grade ?? currentUser.studentClass,
      );
      await localDataSource.saveUser(updatedUser);
    }
  }
}
