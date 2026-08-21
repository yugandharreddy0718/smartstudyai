import '../domain/user_model.dart';

abstract class AuthRepository {
  Future<UserModel> registerWithEmail(String email, String password, String name, String grade);
  Future<UserModel> loginWithEmail(String email, String password);
  Future<void> resetPassword(String email);
  Future<UserModel> signInWithGoogle();
  Future<UserModel> signInAsGuest();
  Future<void> logout();
  Future<UserModel?> getCachedUser();
  Future<void> updateProfile({required String uid, String? name, String? grade, String? studentClass});
}
