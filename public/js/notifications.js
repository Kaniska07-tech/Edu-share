import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.deleteNotification = async function (id) {
  try {
    await deleteDoc(doc(db, "notifications", id));
    loadNotifications(auth.currentUser.uid); // refresh
  } catch (error) {
    console.error(error);
    alert("Error deleting notification");
  }
};
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  loadNotifications(user.uid);
});

async function loadNotifications(userId) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

  const div = document.createElement("div");
div.className = "request-card";

div.innerHTML = `
  <p>${data.message}</p>
  <button onclick="deleteNotification('${docSnap.id}')"
    style="background:#ef4444; margin-top:8px;">
    Remove
  </button>
`;

container.appendChild(div);  
  });

if (container.innerHTML === "") {
  container.innerHTML = `
    <p style="color:gray; text-align:center; padding:10px;">
      You have no notifications
    </p>
  `;
}}