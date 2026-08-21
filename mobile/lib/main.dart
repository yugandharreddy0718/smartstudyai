import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'core/constants/env_config.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/global_error_handler.dart';
import 'firebase/firebase_options.dart';
import 'routes/app_router.dart';

void main() async {
  debugPrint('DEBUG: App Started');
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Global Error Handler
  GlobalErrorHandler.initialize();

  // Load Environment Variables
  await EnvConfig.load();
  debugPrint('DEBUG: Env Loaded');
  debugPrint('DEBUG: API Base URL: ${EnvConfig.apiBaseUrl}');

  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  debugPrint('DEBUG: Firebase Initialized');

  // Initialize Google Sign In
  final clientId = EnvConfig.googleServerClientId;
  if (clientId.isNotEmpty) {
    await GoogleSignIn.instance.initialize(serverClientId: clientId);
    debugPrint('DEBUG: GoogleSignIn Initialized');
  }

  runApp(
    const ProviderScope(
      child: SmartStudyApp(),
    ),
  );
}

class SmartStudyApp extends ConsumerWidget {
  const SmartStudyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'SmartStudy AI',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
