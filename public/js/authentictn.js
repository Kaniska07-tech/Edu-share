
import { auth } from "./firebase.js";
import { db } from "./firebase.js";
import { doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const provider = new GoogleAuthProvider();

document.querySelector("#googleSignInBtn").addEventListener("click", function(){
  
   
signInWithPopup(auth, provider)
  .then(async (result) => {
    const user = result.user;

    console.log("User:", user);

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "student" 
      });
    }

   
    const updatedSnap = await getDoc(userRef);
    const role = updatedSnap.data().role;

    console.log("Role:", role);

  
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "delivery") {
      window.location.href = "delivery.html";
    } else {
      window.location.href = "profile.html";
    }

  })
  .catch((error) => {
    console.error(error);
    alert(error.message);
  });
});