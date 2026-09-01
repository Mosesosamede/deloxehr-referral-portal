import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Reusable server-side Firebase Admin SDK initialization wrapper.
 * This is used for secure server actions, page logic, or onboarding endpoints.
 */
export function getFirebaseAdminApp() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK can only be initialized on the server side.');
  }

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
    
    if (privateKey) {
      // Remove surrounding quotes if they exist
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!projectId || !clientEmail || !privateKey) {
      console.warn(
        'Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are incomplete. ' +
        'Admin SDK features may not function until these are configured.'
      );
      return null;
    }

    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      return null;
    }
  }

  return getApp();
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAuth(app);
}
