import admin from 'firebase-admin';
import serviceAccount from '../../firebaseconfig.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://winter-project-faf08-default-rtdb.firebaseio.com'
});

export const db = admin.firestore();
export const auth = admin.auth();
