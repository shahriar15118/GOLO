import admin from 'firebase-admin';

// In AI Studio Build, the service account is often available via ADC or we can use the project ID if it's default.
// However, the set_up_firebase tool might have created a service account key or we can use environment variables.
// For now, we will initialize with just the project ID which works in standard Cloud Run environments if permissions are set, 
// or it might require a manual credential if the user provides one.
// Since I don't have a service account file path, I'll attempt to initialize with default credentials.

try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'golo-luxury'
  });
} catch (err) {
  if (!/already exists/.test(err.message)) {
    console.error('Firebase Admin initialization error:', err.stack);
  }
}

export default admin;
