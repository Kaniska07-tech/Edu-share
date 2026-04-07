import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


async function loadRequests() {
  const container = document.getElementById("requestContainer");
  if (!container) return;

  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "requests"));

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const requestId = docSnap.id;

    if (data.status === "withdrawn" || data.status === "completed") return;

    const card = document.createElement("div");
    card.className = "request-card";

    const isRequester = auth.currentUser.uid === data.userId;
    const isMatched = data.status === "matched";

    let actionButton = "";

 if (data.status === "completed" || data.status === "withdrawn") {
  actionButton = "";
}
else if (isRequester) {
  actionButton = `
    <button id="withdraw-${requestId}">
      Withdraw Request
    </button>`;
}
  else  if (data.status === "open") {
      actionButton = `
        <button id="btn-${requestId}">Help this student</button>

        <div id="form-${requestId}" style="display:none;">
          <input id="name-${requestId}" placeholder="Your Name">
          <input id="email-${requestId}" placeholder="Your Email">
          <input id="address-${requestId}" placeholder="Your Address">
          <input id="phone-${requestId}" type="number" placeholder="Your Phone Number">
          <button id="submit-${requestId}">Submit</button>
          <button id="close-${requestId}" style="background:#ccc;">Close</button>
        </div>
      `;
    }

    
    else if (isMatched && !isRequester) {
      actionButton = `
        <button onclick="cancelDonation('${requestId}')"
        style="background:#ef4444;">
        Cancel Donation
        </button>`;
    }

   

  
    card.innerHTML = `
      <h3>${data.itemName}</h3>
      <p><strong>Subject:</strong> ${data.subject || "N/A"}</p>
      <p><strong>Location:</strong> ${data.location || "N/A"}</p>
      <p><strong>Price:</strong> ₹${data.price || "N/A"} (COD)</p>
      ${actionButton}
    `;

    container.appendChild(card);

    const btn = document.getElementById(`btn-${requestId}`);
    const form = document.getElementById(`form-${requestId}`);

    if (btn && form) {
      btn.addEventListener("click", () => {
        form.style.display =
          form.style.display === "none" ? "block" : "none";
      });
    }

 
    const closeBtn = document.getElementById(`close-${requestId}`);
    if (closeBtn && form) {
      closeBtn.addEventListener("click", () => {
        form.style.display = "none";
      });
    }

    const submitBtn = document.getElementById(`submit-${requestId}`);

    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {

        if (!auth.currentUser) {
          alert("Please login first");
          return;
        }

        const donorName = document.getElementById(`name-${requestId}`).value;
        const donorEmail = document.getElementById(`email-${requestId}`).value;
        const donorAddress = document.getElementById(`address-${requestId}`).value;
        const donorPhone = document.getElementById(`phone-${requestId}`).value;
        if (!donorName || !donorEmail || !donorAddress || !donorPhone) {
          alert("Fill all fields");
          return;
        }

        try {
          const requestRef = doc(db, "requests", requestId);
          const requestSnap = await getDoc(requestRef);
          const requestData = requestSnap.data();

         
          if (requestData.userId === auth.currentUser.uid) {
            alert("You can't donate to your own request!");
            return;
          }

       
          if (requestData.status !== "open") {
            alert("Already taken!");
            return;
          }

      
          await addDoc(collection(db, "deliveries"), {
            requestId,
            itemName: requestData.itemName,
            donorId: auth.currentUser.uid,
            requesterId: requestData.userId,

            donorName,
            donorEmail,
            donorAddress,
            donorPhone,
            requesterPhone: requestData.phone || "N/A",
            price: requestData.price, // 💰

            status: "pickup_pending",
            deliveryPersonId: null,
            createdAt: new Date()
          });

          await updateDoc(requestRef, {
            status: "matched"
          });

          alert("Donation submitted! (Cash on Delivery)");

          loadRequests();

        } catch (error) {
          console.error(error);
          alert("Error submitting donation");
        }
      });
    }

    
    const withdrawBtn = document.getElementById(`withdraw-${requestId}`);

    if (withdrawBtn) {
      withdrawBtn.addEventListener("click", async () => {

        if (!confirm("Withdraw this request?")) return;

        await updateDoc(doc(db, "requests", requestId), {
          status: "withdrawn"
        });

       

const deliverySnap = await getDocs(collection(db, "deliveries"));

for (const d of deliverySnap.docs) {
  if (d.data().requestId === requestId) {
    await updateDoc(doc(db, "deliveries", d.id), {
      status: "cancelled"
    });
  }
} alert("Request withdrawn");
        loadRequests();
      });
    }

  });
}

window.cancelDonation = async function (requestId) {

  if (!confirm("Cancel this donation?")) return;

  try {
    const requestRef = doc(db, "requests", requestId);

    await updateDoc(requestRef, {
      status: "open"
    });

    const deliverySnap = await getDocs(collection(db, "deliveries"));

   for (const d of deliverySnap.docs) {
  if (d.data().requestId === requestId) {
    await updateDoc(doc(db, "deliveries", d.id), {
      status: "cancelled"
    });
  }
}
    alert("Donation cancelled");

    loadRequests();

  } catch (error) {
    console.error(error);
    alert("Error cancelling donation");
  }
};


window.addEventListener("DOMContentLoaded", loadRequests);