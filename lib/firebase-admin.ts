import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import appletConfig from '../firebase-applet-config.json';

/**
 * Reusable server-side Firebase Admin SDK initialization wrapper.
 * This is used for secure server actions, page logic, or onboarding endpoints.
 */
export function getFirebaseAdminApp() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK can only be initialized on the server side.');
  }

  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || appletConfig.projectId;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
    
    if (privateKey) {
      // Remove surrounding quotes if they exist
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    try {
      if (clientEmail && privateKey) {
        return initializeApp({
          credential: cert({
            projectId: projectId || 'deloxehr-d0f61',
            clientEmail,
            privateKey,
          }),
        });
      } else if (projectId) {
        return initializeApp({
          projectId,
        });
      } else {
        return initializeApp();
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      try {
        return initializeApp({ projectId: 'deloxehr-d0f61' });
      } catch (e) {
        return null;
      }
    }
  }

  return getApp();
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const dbId = appletConfig.firestoreDatabaseId;
  if (dbId && dbId !== '(default)') {
    return getFirestore(app, dbId);
  }
  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getAuth(app);
}

