import admin from 'firebase-admin';
import serviceAccount from '../../firebaseconfig.json';
import '../dotenv';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_NAME
});
export const db = admin.firestore();
export const auth = admin.auth(admin);
export const storage = admin.storage(admin);
