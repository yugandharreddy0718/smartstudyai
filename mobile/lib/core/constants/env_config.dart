import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  static late String _apiBaseUrl;
  
  static String get apiBaseUrl => _apiBaseUrl;
  
  static String get googleServerClientId => dotenv.env['GOOGLE_SERVER_CLIENT_ID'] ?? '';
  
  static Future<void> load() async {
    await dotenv.load(fileName: ".env");
    
    final envUrl = dotenv.env['VITE_API_BASE_URL'];
    if (envUrl == null || envUrl.isEmpty) {
      throw Exception('VITE_API_BASE_URL must be defined in .env file.');
    }
    _apiBaseUrl = envUrl;
  }
}
