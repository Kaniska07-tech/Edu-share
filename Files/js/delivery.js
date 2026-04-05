import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const role = userDoc.data().role;

  if (role !== "delivery") {
    alert("Access denied");
    window.location.href = "profile.html";
    return;
  }

  loadDeliveries();
});


async function loadDeliveries() {
  const container = document.getElementById("deliveryContainer");
  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "deliveries"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const deliveryId = docSnap.id;


    if (
      data.deliveryPersonId &&
      data.deliveryPersonId !== auth.currentUser.uid
    ) return;

    const statusText = {
      pickup_pending: "Waiting for Pickup",
      picked_up: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };

    const card = document.createElement("div");
    card.className = "request-card";

    card.innerHTML = `
      <h3>${data.itemName}</h3>
      <p><strong>Donor:</strong> ${data.donorName || "N/A"}</p>
      <p><strong>Address:</strong> ${data.donorAddress || "N/A"}</p>
      <p><strong>Requester ID:</strong> ${data.requesterId}</p>
     <p><strong>Price:</strong> ₹${data.price || "N/A"} (COD)</p>
      <p>
        <strong>Status:</strong> 
        <span style="
          color:
          ${data.status === "pickup_pending" ? "orange" :
            data.status === "picked_up" ? "blue" :
            data.status === "delivered" ? "green" : "red"}
        ">
          ${statusText[data.status]}
        </span>
      </p>

      ${renderButtons(data, deliveryId)}
    `;

    container.appendChild(card);
  });
}

function renderButtons(data, deliveryId) {

  if (data.status === "pickup_pending") {
    return `<button onclick="pickup('${deliveryId}')">
              Pick Up This Delivery
            </button>`;
  }

  if (data.status === "picked_up") {
    return `<button onclick="deliver('${deliveryId}')">
              Mark as Delivered
            </button>`;
  }

  if (data.status === "cancelled") {
    return `<p style="color:red;">Cancelled</p>`;
  }

  return `<p>Completed</p>`;
}


window.pickup = async function (deliveryId) {
  try {
    const deliveryRef = doc(db, "deliveries", deliveryId);
    const snap = await getDoc(deliveryRef);
    const data = snap.data();

    if (data.status !== "pickup_pending") {
      alert("Already picked by someone else!");
      return;
    }

    await updateDoc(deliveryRef, {
      status: "picked_up",
      deliveryPersonId: auth.currentUser.uid
    });

   
    await addDoc(collection(db, "notifications"), {
      userId: data.requesterId,
      message: "Your requested item will be picked up within 3 days.",
      createdAt: new Date(),
      read: false
    });

  
    await addDoc(collection(db, "notifications"), {
      userId: data.donorId,
      message: "Your donation will be picked up within 3 days.",
      createdAt: new Date(),
      read: false
    });

    alert("Picked up successfully!");
    loadDeliveries();

  } catch (error) {
    console.error(error);
    alert("Error picking delivery");
  }
};

window.deliver = async function (deliveryId) {
  try {
    const deliveryRef = doc(db, "deliveries", deliveryId);
    const snap = await getDoc(deliveryRef);
    const data = snap.data();

    console.log("Full delivery data:", data);
console.log("Request ID:", data.requestId);
    if (data.deliveryPersonId !== auth.currentUser.uid) {
      alert("This is not your delivery!");
      return;
    }

    await updateDoc(deliveryRef, {
      status: "delivered"
    });
  const requestRef = doc(db, "requests", data.requestId);

await updateDoc(requestRef, {
  status: "completed"
});
    
    await addDoc(collection(db, "notifications"), {
      userId: data.requesterId,
      message: "Your requested item has been delivered.",
      createdAt: new Date(),
      read: false
    });

  
    await addDoc(collection(db, "notifications"), {
      userId: data.donorId,
      message: "Your donation has been successfully delivered.",
      createdAt: new Date(),
      read: false
    });

    alert("Delivered successfully!");
    loadDeliveries();

  } catch (error) {
    console.error(error);
    alert("Error delivering");
  }
};