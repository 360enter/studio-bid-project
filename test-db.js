const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
try {
  const db = getFirestore(admin.app(), "ai-studio-5b5c4529-ba24-4080-a31b-63f7464bf1cb");
  console.log("Success with getFirestore:", db !== null);
} catch (e) {
  console.error("Error:", e.message);
}
