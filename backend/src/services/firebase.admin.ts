import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Initialise Firebase Admin SDK once using environment variables.
 * Supports both individual env vars (production) and a service account
 * JSON file path (local dev if GOOGLE_APPLICATION_CREDENTIALS is set).
 */
function initFirebaseAdmin(): void {
  if (admin.apps.length > 0) return; // Already initialised

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. ' +
      'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  console.log('✓ Firebase Admin SDK initialised (project:', projectId, ')');
}

initFirebaseAdmin();

/** Firestore Admin instance — used across all service files */
export const db = getFirestore();

/** Firebase Auth Admin instance — used for token verification */
export const auth = getAuth();

export default admin;
