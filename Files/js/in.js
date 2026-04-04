
import { db, auth } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🌅 Greeting
const show = document.querySelector("#Show");
const current = new Date();
const hour = current.getHours();

if (hour >= 4 && hour < 12) {
  show.innerHTML = `Good Morning!`;
} else if (hour >= 12 && hour < 17) {
  show.innerHTML = `Good Afternoon!`;
} else {
  show.innerHTML = `Good Evening!`;
}


async function loadDonationCount(userId) {
  try {
    const q = query(
      collection(db, "deliveries"), 
      where("donorId", "==", userId),
      where("status", "==", "delivered") 
    );

    const snapshot = await getDocs(q);
    const count = snapshot.size;

    const donationText = document.getElementById("donationCount");

    donationText.textContent =
      `You have made ${count} donation${count === 1 ? "" : "s"} so far.`;

  } catch (error) {
    console.error("Error loading donations:", error);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {

   
    document.getElementById("userName").textContent =
      user.displayName || "User";

    document.getElementById("userEmail").textContent =
      user.email || "No Email";

    document.getElementById("userPhoto").src =
      user.photoURL || "https://via.placeholder.com/120";

   
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