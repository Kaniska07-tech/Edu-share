import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const role = userDoc.data().role;

  if (role !== "admin") {
    alert("Access denied");
    window.location.href = "profile.html";
    return;
  }

  loadUsers();
});


async function loadUsers() {
  const container = document.getElementById("userContainer");
  container.innerHTML = "";

  const filter = document.getElementById("roleFilter").value;
  const search = document.getElementById("searchInput").value.toLowerCase();

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const userId = docSnap.id;
if (data.role === "admin") return;
   
    if (userId === auth.currentUser.uid) return;

    
    if (filter !== "all" && data.role !== filter) return;

  
    const name = (data.name || "").toLowerCase();
    const email = (data.email || "").toLowerCase();

    if (!name.includes(search) && !email.includes(search)) return;

    const card = document.createElement("div");
    card.className = "request-card";

    card.innerHTML = `
      <h3>${data.name || "No Name"}</h3>
      <p>${data.email}</p>

      <p>
        <strong>Role:</strong> 
        <span style="color:${data.role === "delivery" ? "green" : "blue"}">
          ${data.role}
        </span>
      </p>

      ${data.role === "delivery"
        ? `<button id="toggle-${userId}" style="background:#ef4444;">
              Remove Delivery Role
           </button>`
        : `<button id="toggle-${userId}">
              Make Delivery Boy
           </button>`
      }
    `;

    container.appendChild(card);


    document.getElementById(`toggle-${userId}`)
      .addEventListener("click", async () => {

        const newRole = data.role === "delivery" ? "student" : "delivery";

        const confirmMessage =
          newRole === "delivery"
            ? "Make this user a delivery boy?"
            : "Remove delivery role and make student?";

        if (!confirm(confirmMessage)) return;

        try {
          await updateDoc(doc(db, "users", userId), {
            role: newRole
          });

          alert(`Role updated to ${newRole}`);

          loadUsers(); 

        } catch (error) {
          console.error(error);
          alert("Error updating role");
        }
      });
  });
}


document.getElementById("roleFilter")
  .addEventListener("change", loadUsers);


  let timeout;

document.getElementById("searchInput")
  .addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(loadUsers, 300);
  });