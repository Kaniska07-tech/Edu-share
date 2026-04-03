
import { db, auth } from "./firebase.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// same config

const show=document.querySelector("#Show"); 
const current = new Date(); //Used date function to greet
 const hour=current.getHours();

  if(hour>=4 && hour<12){
show.innerHTML=`Good Morning!`
 }
 else if(hour>=12 && hour<17 ){
    show.innerHTML=`Good Afternoon!`;
 }
else if(hour>=17 || hour<4){
    show.innerHTML=`Good Evening!`;
}
async function loadDonationCount(userId) {
  try {
    const q = query(
      collection(db, "donations"),
      where("donorId", "==", userId)
    );

    const snapshot = await getDocs(q);

    const count = snapshot.size;

    const donationText = document.getElementById("donationCount");

    donationText.textContent = `You have made ${count} donation${count === 1 ? "" : "s"} so far.`;

  } catch (error) {
    console.error("Error loading donations:", error);
  }
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userName").textContent = user.displayName;
    document.getElementById("userEmail").textContent = user.email;

    
    document.getElementById("userPhoto").src = user.photoURL;
    loadDonationCount(user.uid);
  } else {
    window.location.href = "home.html";
  }

  
});

document.getElementById("signOutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "home.html";
  });
});
document.getElementById("userPhoto").src = user.photoURL || "https://via.placeholder.com/120";

