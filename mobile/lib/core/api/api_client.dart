import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/env_config.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio dio;

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
    dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        options.baseUrl = EnvConfig.apiBaseUrl; // Dynamically resolve the URL on every request
        debugPrint('--- API REQUEST ---');
        debugPrint('REQUEST METHOD: ${options.method}');
        debugPrint('REQUEST URL: ${options.uri}');
        debugPrint('REQUEST BODY: ${options.data}');
        debugPrint('-------------------');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        debugPrint('--- API RESPONSE ---');
        debugPrint('RESPONSE STATUS: ${response.statusCode}');
        debugPrint('RESPONSE BODY: ${response.data}');
        debugPrint('--------------------');
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        debugPrint('--- API ERROR ---');
        debugPrint('REQUEST URL: ${e.requestOptions.uri}');
        debugPrint('RESPONSE STATUS: ${e.response?.statusCode}');
        debugPrint('RESPONSE BODY: ${e.response?.data}');
        debugPrint('ERROR STACKTRACE: ${e.stackTrace}');
        debugPrint('-----------------');
        return handler.next(e);
      },
    ));
  }
}
