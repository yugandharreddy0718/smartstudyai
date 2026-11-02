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
  final List<String> completedLessons;

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
    this.completedLessons = const [],
  });

  // Getter for grade compatibility
  String get grade => studentClass ?? '8';

  // Role helpers with case-insensitive normalization
  String get normalizedRole => role.trim().toLowerCase();
  bool get isAdmin => normalizedRole == 'admin' || normalizedRole == 'superadmin';
  bool get isSuperAdmin => normalizedRole == 'superadmin';
  bool get isStudent => !isAdmin;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic val, int defaultVal) {
      if (val is int) return val;
      if (val is num) return val.toInt();
      if (val is String) return int.tryParse(val) ?? defaultVal;
      return defaultVal;
    }

    String toStringVal(dynamic val, String defaultVal) {
      if (val == null) return defaultVal;
      return val.toString();
    }

    List<String> toListVal(dynamic val) {
      if (val is List) {
        return val.map((e) => e.toString()).toList();
      }
      return [];
    }

    Map<String, dynamic>? statsMap;
    if (json['stats'] is Map) {
      statsMap = Map<String, dynamic>.from(json['stats'] as Map);
    }

    final parsedXp = toInt(statsMap?['xp'] ?? json['xp'], 0);
    final parsedLevel = toInt(statsMap?['level'] ?? json['level'], 1);
    final parsedStreak = toInt(statsMap?['streak'] ?? json['streak'], 0);

    final rawClass = json['studentClass'] ?? json['grade'] ?? '8';
    final cleanClass = toStringVal(rawClass, '8').replaceAll(RegExp(r'^(class_?)', caseSensitive: false), '');

    final completedList = toListVal(json['completedLessons']);

    return UserModel(
      id: toStringVal(json['id'] ?? json['uid'], ''),
      email: json['email']?.toString(),
      displayName: (json['displayName'] ?? json['name'])?.toString(),
      photoURL: (json['photoURL'] ?? json['photoUrl'])?.toString(),
      studentClass: cleanClass.isEmpty ? '8' : cleanClass,
      role: toStringVal(json['role'], 'student'),
      xp: parsedXp,
      level: parsedLevel,
      streak: parsedStreak,
      isGuest: json['isGuest'] == true,
      completedLessons: completedList,
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
      'xp': xp,
      'level': level,
      'streak': streak,
      'stats': {
        'xp': xp,
        'level': level,
        'streak': streak,
      },
      'isGuest': isGuest,
      'completedLessons': completedLessons,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? displayName,
    String? photoURL,
    String? studentClass,
    String? role,
    int? xp,
    int? level,
    int? streak,
    bool? isGuest,
    List<String>? completedLessons,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoURL: photoURL ?? this.photoURL,
      studentClass: studentClass ?? this.studentClass,
      role: role ?? this.role,
      xp: xp ?? this.xp,
      level: level ?? this.level,
      streak: streak ?? this.streak,
      isGuest: isGuest ?? this.isGuest,
      completedLessons: completedLessons ?? this.completedLessons,
    );
  }
}

