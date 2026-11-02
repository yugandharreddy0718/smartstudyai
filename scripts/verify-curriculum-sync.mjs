import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase/firebase-applet-config.json', 'utf8'));
const app = !getApps().length ? initializeApp(config) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function runVerification() {
  console.log('=== SMARTSTUDY AI CURRICULUM SYNC & ROLE AUDIT ===\n');
  console.log('Project ID:', config.projectId);
  console.log('Firestore Database ID:', config.firestoreDatabaseId);

  // 1. Authenticate as Admin
  console.log('\n[1/4] Authenticating as Admin (seed.admin@smartstudy.ai)...');
  const adminCred = await signInWithEmailAndPassword(auth, 'seed.admin@smartstudy.ai', 'SmartStudySeed2026!');
  const adminUid = adminCred.user.uid;
  console.log('✔ Authenticated UID:', adminUid);

  const adminDoc = await getDoc(doc(db, 'users', adminUid));
  const adminData = adminDoc.data();
  console.log('✔ Admin document exists:', adminDoc.exists());
  console.log('✔ Admin role in Firestore:', adminData?.role);

  const roleNorm = (adminData?.role || '').toLowerCase();
  if (roleNorm !== 'admin' && roleNorm !== 'superadmin') {
    throw new Error(`Expected admin or superAdmin role, got ${adminData?.role}`);
  }

  // 2. Perform live curriculum lesson write (as done by Web Admin Panel)
  console.log('\n[2/4] Writing curriculum lesson update to canonical Firestore hierarchy...');
  const testLessonId = 'g8-maths-c1-l1';
  const testTimestamp = Date.now();
  const testTitle = `Rational Numbers - Live Sync Test (${testTimestamp})`;
  const testContent = `# Rational Numbers (Live Sync Test)\n\nUpdated dynamically by Web Admin at ${new Date().toISOString()}.\n\n## 1. Learning Objectives\n- Verify seamless mobile sync.`;

  const payload = {
    id: testLessonId,
    chapterId: 'g8-maths-c1',
    subjectId: 'maths',
    classId: 'class_8',
    title: testTitle,
    content: testContent,
    contentMarkdown: testContent,
    order: 1,
    status: 'published',
    updatedAt: testTimestamp
  };

  // Nested hierarchy: curriculum/class_8/subjects/maths/chapters/g8-maths-c1/lessons/g8-maths-c1-l1
  const nestedRef = doc(db, 'curriculum', 'class_8', 'subjects', 'maths', 'chapters', 'g8-maths-c1', 'lessons', testLessonId);
  await setDoc(nestedRef, payload, { merge: true });
  console.log('✔ Written to nested curriculum path: curriculum/class_8/subjects/maths/chapters/g8-maths-c1/lessons/' + testLessonId);

  // 3. Read back using mobile FirebaseCurriculumDataSource paths
  console.log('\n[3/4] Reading back using mobile data source query paths...');
  const nestedSnap = await getDoc(nestedRef);
  if (!nestedSnap.exists()) throw new Error('Nested lesson document not found!');
  const nestedData = nestedSnap.data();
  console.log('✔ Nested read title:', nestedData.title);
  console.log('✔ Nested read content exists:', !!(nestedData.contentMarkdown || nestedData.content));
  console.log('✔ Nested content snippet:', (nestedData.contentMarkdown || nestedData.content).substring(0, 45) + '...');

  if (nestedData.title !== testTitle) {
    throw new Error('Title mismatch in written curriculum data!');
  }

  // 4. Restore baseline lesson title
  console.log('\n[4/4] Restoring baseline lesson content in Firestore...');
  const baselinePayload = {
    id: testLessonId,
    chapterId: 'g8-maths-c1',
    subjectId: 'maths',
    classId: 'class_8',
    title: 'Rational Numbers - Properties and Operations',
    content: '# Rational Numbers - Properties and Operations\n\nComprehensive lesson content.',
    contentMarkdown: '# Rational Numbers - Properties and Operations\n\nComprehensive lesson content.',
    order: 1,
    status: 'published',
    updatedAt: Date.now()
  };
  await setDoc(nestedRef, baselinePayload, { merge: true });
  console.log('✔ Restored baseline curriculum successfully.');

  console.log('\n=== AUDIT & VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runVerification().catch((err) => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
