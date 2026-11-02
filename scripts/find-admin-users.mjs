import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase/firebase-applet-config.json', 'utf8'));
const app = !getApps().length ? initializeApp(config) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function findAdmins() {
  await signInWithEmailAndPassword(auth, 'seed.admin@smartstudy.ai', 'SmartStudySeed2026!');
  const snap = await getDocs(collection(db, 'users'));
  console.log('--- ALL USERS WITH EMAIL ---');
  snap.forEach(d => {
    const data = d.data();
    if (data.email) {
      console.log({
        uid: d.id,
        email: data.email,
        displayName: data.displayName || data.name,
        role: data.role
      });
    }
  });
}

findAdmins().catch(console.error);
