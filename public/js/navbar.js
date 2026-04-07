import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {

  const adminLink = document.getElementById("adminLink");
  const deliveryLink = document.getElementById("deliveryLink");

  if (!user) {
    if (adminLink) adminLink.style.display = "none";
    if (deliveryLink) deliveryLink.style.display = "none";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const role = userDoc.data().role;


  if (adminLink) {
    adminLink.style.display = role === "admin" ? "inline-block" : "none";
  }


  if (deliveryLink) {
    deliveryLink.style.display = role === "delivery" ? "inline-block" : "none";
  }
});