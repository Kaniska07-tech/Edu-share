
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDIPBPZPEYXfsgplX-ielrgsRB4YoTeJN0",
  authDomain: "authenticator-7aa25.firebaseapp.com",
  projectId: "authenticator-7aa25",
  storageBucket: "authenticator-7aa25.firebasestorage.app",
  messagingSenderId: "344247428465",
  appId: "1:344247428465:web:990c2e8c5ab8fa1e8e42d0"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };