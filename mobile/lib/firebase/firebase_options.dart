import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAg35cKg47cqV0_FPLkpl_F_DmkOM5Aj0o',
    appId: '1:336289674024:web:371e88e5c3ed80e3e6d61d',
    messagingSenderId: '336289674024',
    projectId: 'gen-lang-client-0319194827',
    authDomain: 'gen-lang-client-0319194827.firebaseapp.com',
    storageBucket: 'gen-lang-client-0319194827.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAg35cKg47cqV0_FPLkpl_F_DmkOM5Aj0o',
    appId: '1:336289674024:web:371e88e5c3ed80e3e6d61d',
    messagingSenderId: '336289674024',
    projectId: 'gen-lang-client-0319194827',
    storageBucket: 'gen-lang-client-0319194827.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAg35cKg47cqV0_FPLkpl_F_DmkOM5Aj0o',
    appId: '1:336289674024:ios:placeholder',
    messagingSenderId: '336289674024',
    projectId: 'gen-lang-client-0319194827',
    storageBucket: 'gen-lang-client-0319194827.firebasestorage.app',
    iosBundleId: 'com.smartstudy.ai',
  );
}
