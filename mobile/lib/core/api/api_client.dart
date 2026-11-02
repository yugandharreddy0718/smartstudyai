import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ApiClient {
  static String get baseUrl {
    // 1. Check compile-time environment variable (--dart-define=API_BASE_URL=https://...)
    const compileTimeUrl = String.fromEnvironment('API_BASE_URL');
    if (compileTimeUrl.trim().isNotEmpty) {
      return compileTimeUrl.trim();
    }

    // 2. Check loaded .env file
    if (dotenv.isInitialized) {
      final envUrl = dotenv.env['API_BASE_URL'] ?? dotenv.env['VITE_API_BASE_URL'];
      if (envUrl != null && envUrl.trim().isNotEmpty) {
        return envUrl.trim();
      }
    }

    // 3. Fallback default for adb reverse
    return 'http://127.0.0.1:3000';
  }

  static Dio get dio => Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
  ));

  static Future<Map<String, String>> _getHeaders() async {
    final headers = {'Content-Type': 'application/json'};
    try {
      final currentUser = FirebaseAuth.instance.currentUser;
      if (currentUser != null) {
        final token = await currentUser.getIdToken();
        if (token != null) {
          headers['Authorization'] = 'Bearer $token';
        }
      }
    } catch (e) {
      debugPrint('DEBUG: Error or uninitialized Firebase Auth in ApiClient: $e');
    }
    return headers;
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    final rawBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final uri = Uri.parse('$rawBase$cleanEndpoint');
    final headers = await _getHeaders();

    debugPrint('--------------------------------------------------');
    debugPrint('REQUEST URL: $uri');
    debugPrint('REQUEST HEADERS: $headers');
    debugPrint('REQUEST BODY: ${jsonEncode(body)}');

    try {
      final response = await http.post(
        uri,
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 30)); // 30s overall request timeout

      debugPrint('STATUS CODE: ${response.statusCode}');
      debugPrint('RESPONSE BODY: ${response.body}');
      debugPrint('--------------------------------------------------');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final jsonResponse = jsonDecode(response.body);
        return jsonResponse;
      } else {
        dynamic errJson;
        try {
          errJson = jsonDecode(response.body);
        } catch (_) {}

        if (errJson is Map) {
          final errCode = errJson['code']?.toString();
          final errMessage = (errJson['error'] ?? errJson['message'] ?? response.body).toString();
          if (response.statusCode == 429 || errCode == 'AI_QUOTA_EXHAUSTED' || errMessage.toLowerCase().contains('quota')) {
            throw Exception('Gemini service unavailable: AI daily quota has been exhausted. Please try again later.');
          }
          throw Exception('Backend returned an error: $errMessage');
        }
        throw Exception('Request failed with status ${response.statusCode}');
      }
    } on SocketException catch (e) {
      debugPrint('EXCEPTION: SocketException connecting to $uri -> $e');
      throw Exception('Backend server is not running or unable to connect to backend at $rawBase.');
    } on TimeoutException catch (e) {
      debugPrint('EXCEPTION: TimeoutException connecting to $uri -> $e');
      throw Exception('Request timed out waiting for backend ($rawBase).');
    } catch (e) {
      debugPrint('EXCEPTION: $e');
      if (e.toString().contains('Exception:')) {
        rethrow;
      }
      throw Exception('Authentication/configuration error or network request failed: $e');
    }
  }
}
