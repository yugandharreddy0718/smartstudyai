import 'package:hive_flutter/hive_flutter.dart';
import '../domain/offline_repository.dart';
import '../domain/lesson_model.dart';
import 'dart:convert';

class HiveOfflineDataSource implements OfflineRepository {
  static const String _boxName = 'offline_lessons';
  late Box<String> _box;
  bool _isInitialized = false;

  @override
  Future<void> initialize() async {
    if (!_isInitialized) {
      await Hive.initFlutter();
      _box = await Hive.openBox<String>(_boxName);
      _isInitialized = true;
    }
  }

  @override
  Future<void> cacheLesson(LessonModel lesson) async {
    await initialize();
    final jsonString = jsonEncode(lesson.toMap());
    await _box.put(lesson.id, jsonString);
  }

  @override
  Future<LessonModel?> getCachedLesson(String lessonId) async {
    await initialize();
    final jsonString = _box.get(lessonId);
    if (jsonString != null) {
      final map = jsonDecode(jsonString) as Map<String, dynamic>;
      return LessonModel.fromMap(map, lessonId);
    }
    return null;
  }

  @override
  Future<bool> isLessonCached(String lessonId) async {
    await initialize();
    return _box.containsKey(lessonId);
  }

  @override
  Future<void> removeCachedLesson(String lessonId) async {
    await initialize();
    await _box.delete(lessonId);
  }

  @override
  Future<List<LessonModel>> getAllCachedLessons() async {
    await initialize();
    final List<LessonModel> lessons = [];
    for (var key in _box.keys) {
      final jsonString = _box.get(key);
      if (jsonString != null) {
        final map = jsonDecode(jsonString) as Map<String, dynamic>;
        lessons.add(LessonModel.fromMap(map, key.toString()));
      }
    }
    return lessons;
  }
}
