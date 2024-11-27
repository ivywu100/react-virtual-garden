import admin from 'firebase-admin';
import * as path from 'path';

// Initialize the Firebase Admin SDK (only once)
if (typeof window === 'undefined') {
  // const projectRoot = process.cwd();
  // const serviceAccountPath = path.resolve(projectRoot, 'secrets/firebase-service-account-file.json');
  if (!admin.apps.length) {
    console.log('Firebase Admin initialized');
    const base64EncodedJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    // Check if the environment variable is undefined or empty
    if (!base64EncodedJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing or empty');
    }
    const serviceAccountJson = Buffer.from(base64EncodedJson, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.log('Firebase Admin already initialized');
    // admin.apps.forEach((app) => {
    //   if (app) app.delete();
    //   console.log('Deleted existing Firebase Admin app');
    // });
    // admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccountPath),
    // });
  }
}
// Rename the default export to 'firebaseAdmin'
export const firebaseAdmin = admin;
