import admin from 'firebase-admin';

const PROJECT_ID = 'gen-lang-client-0319194827';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
  });
}

export async function setPasswordForUser(): Promise<void> {
  const targetEmail = process.env.TARGET_EMAIL || 'yugandharreddymukthapurram@gmail.com';
  const newPassword = process.env.NEW_PASSWORD || process.argv[2];

  if (!newPassword || newPassword.trim().length < 6) {
    console.error('ERROR: A password of at least 6 characters must be provided via process.env.NEW_PASSWORD or as a command-line argument.');
    process.exit(1);
  }

  console.log(`[INFO] Searching for existing Firebase Auth user with email: ${targetEmail}`);

  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(targetEmail);
  } catch (error: any) {
    console.error(`[ERROR] User lookup failed for ${targetEmail}: ${error.message}`);
    process.exit(1);
  }

  // Print UID and providers only - NEVER print the password
  console.log('==================================================');
  console.log(`[TARGET USER FOUND]`);
  console.log(`UID: ${userRecord.uid}`);
  console.log(`Email: ${userRecord.email}`);
  console.log(`Email Verified: ${userRecord.emailVerified}`);
  console.log(`Providers: ${userRecord.providerData.map((p) => p.providerId).join(', ') || 'none'}`);
  console.log('==================================================');

  // Safety checks
  if (!userRecord.uid) {
    console.error('[ERROR] Target UID invalid or empty. Aborting.');
    process.exit(1);
  }

  console.log(`[ACTION] Updating password on UID: ${userRecord.uid} using admin.auth().updateUser()...`);

  // Update password via Admin SDK updateUser()
  // Preserves existing UID, Firestore docs, claims, and auth attributes.
  await admin.auth().updateUser(userRecord.uid, {
    password: newPassword.trim(),
  });

  // Re-fetch user record to verify providers updated safely
  const updatedUserRecord = await admin.auth().getUser(userRecord.uid);
  const updatedProviders = updatedUserRecord.providerData.map((p) => p.providerId);

  console.log('==================================================');
  console.log(`[SUCCESS] Password successfully set for existing user!`);
  console.log(`UID (unchanged): ${updatedUserRecord.uid}`);
  console.log(`Active Providers: ${updatedProviders.join(', ')}`);
  console.log('==================================================');
}

// Auto-run if executed directly
setPasswordForUser().catch((err) => {
  console.error('[CRITICAL ERROR] Failed to set password:', err);
  process.exit(1);
});
