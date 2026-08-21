class UserModel {
  final String id;
  final String? email;
  final String? displayName;
  final String? photoURL;
  final String? studentClass;
  final String role;
  final int xp;
  final int level;
  final int streak;
  final bool isGuest;

  UserModel({
    required this.id,
    this.email,
    this.displayName,
    this.photoURL,
    this.studentClass,
    this.role = 'student',
    this.xp = 0,
    this.level = 1,
    this.streak = 0,
    this.isGuest = false,
  });

  // Getter for grade compatibility
  String get grade => studentClass ?? '8';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final statsMap = json['stats'] as Map<String, dynamic>?;
    final parsedXp = statsMap?['xp'] as int? ?? json['xp'] as int? ?? 0;
    final parsedLevel = statsMap?['level'] as int? ?? json['level'] as int? ?? 1;
    final parsedStreak = statsMap?['streak'] as int? ?? json['streak'] as int? ?? 0;

    final rawClass = json['studentClass'] as String? ?? json['grade'] as String? ?? '8';
    final cleanClass = rawClass.replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');

    return UserModel(
      id: json['id'] as String? ?? json['uid'] as String? ?? '',
      email: json['email'] as String?,
      displayName: json['displayName'] as String? ?? json['name'] as String?,
      photoURL: json['photoURL'] as String? ?? json['photoUrl'] as String?,
      studentClass: cleanClass,
      role: json['role'] as String? ?? 'student',
      xp: parsedXp,
      level: parsedLevel,
      streak: parsedStreak,
      isGuest: json['isGuest'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': id,
      'id': id,
      'email': email,
      'displayName': displayName,
      'photoURL': photoURL,
      'studentClass': studentClass,
      'grade': studentClass,
      'role': role,
      'stats': {
        'xp': xp,
        'level': level,
        'streak': streak,
      },
      'isGuest': isGuest,
    };
  }


  UserModel copyWith({
    String? id,
    String? email,
    String? displayName,
    String? photoURL,
    String? studentClass,
    int? xp,
    int? level,
    int? streak,
    bool? isGuest,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoURL: photoURL ?? this.photoURL,
      studentClass: studentClass ?? this.studentClass,
      xp: xp ?? this.xp,
      level: level ?? this.level,
      streak: streak ?? this.streak,
      isGuest: isGuest ?? this.isGuest,
    );
  }
}

