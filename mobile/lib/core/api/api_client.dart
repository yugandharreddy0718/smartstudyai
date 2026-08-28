import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ApiClient {
  static final Dio dio = Dio(BaseOptions(baseUrl: baseUrl));

  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    } else {
      return 'http://localhost:3000';
    }
  }

  static Future<Map<String, String>> _getHeaders() async {
    final headers = {'Content-Type': 'application/json'};
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      try {
        final token = await currentUser.getIdToken();
        if (token != null) {
          headers['Authorization'] = 'Bearer $token';
        }
      } catch (e) {
        debugPrint('DEBUG: Error obtaining Firebase ID token in ApiClient: $e');
      }
    }
    return headers;
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();

    debugPrint('DEBUG: ApiClient POST $uri');
    final response = await http.post(
      uri,
      headers: headers,
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 25));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final jsonResponse = jsonDecode(response.body);
      return jsonResponse;
    } else {
      throw Exception('API Error (${response.statusCode}): ${response.body}');
    }
  }
}
