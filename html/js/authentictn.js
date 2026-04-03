
import { auth } from "./firebase.js";
import { signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const provider = new GoogleAuthProvider();

document.querySelector("#googleSignInBtn").addEventListener("click", function(){
    signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
       window.location.href = "profile.html";
    // The signed-in user info.
    const user = result.user;
     console.log("User:", user);
      console.log("Name:", user.displayName);
      console.log("Email:", user.email);
      console.log("Photo:", user.photoURL);
  }).catch((error) => {
    // Handle Errors here.
  
  console.error("Error Code:", error.code);
  alert(error.message);
})
});