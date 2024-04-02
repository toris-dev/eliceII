import admin from 'firebase-admin';
import serviceAccount from '../../firebaseconfig.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();
export const auth = admin.auth(admin);
