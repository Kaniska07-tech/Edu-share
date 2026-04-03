import { db, auth } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadRequests() {
  const container = document.getElementById("requestContainer");
  if (!container) return;

  container.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "requests"));

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const requestId = docSnap.id;

      if (data.status === "open") {

        const card = document.createElement("div");
        card.className = "request-card";
  const isOwner =
          auth.currentUser && auth.currentUser.uid === data.userId;

        const actionButton = isOwner
          ? `<button id="withdraw-${requestId}" style="background:#ef4444;">Withdraw Request</button>`
          : `<button id="btn-${requestId}">Help this student</button>`;
        card.innerHTML = `
          <h3>${data.itemName}</h3>
          <p><strong>Subject:</strong> ${data.subject || "N/A"}</p>
          <p><strong>Location:</strong> ${data.location || "N/A"}</p>

         ${actionButton}
          <div id="form-${requestId}" style="display:none; margin-top:10px;">
  <input id="name-${requestId}" placeholder="Your Name">
  <input id="email-${requestId}" placeholder="Your Email">
  <input id="address-${requestId}" placeholder="Your Address">

  <div style="display:flex; gap:10px; margin-top:8px;">
    <button type="button" id="submit-${requestId}">Submit</button>
    <button type="button" id="close-${requestId}">Close</button>
  </div>
</div>
        `;

        container.appendChild(card);
   if (isOwner) {
          document
            .getElementById(`withdraw-${requestId}`)
            .addEventListener("click", async () => {
              try {
                const requestRef = doc(db, "requests", requestId);

                await updateDoc(requestRef, {
                  status: "withdrawn"
                });

                alert("Request withdrawn!");

                loadRequests();

              } catch (error) {
                console.error(error);
                alert("Error withdrawing request");
              }
            });
        }
  if (!isOwner) {
        // 🔁 Toggle form
        document.getElementById(`btn-${requestId}`).addEventListener("click", () => {
          const form = document.getElementById(`form-${requestId}`);
          form.style.display =
            form.style.display === "none" ? "block" : "none";
        });
       document.getElementById(`close-${requestId}`).addEventListener("click", () => {
  const form = document.getElementById(`form-${requestId}`);
  form.style.display = "none";
});
        // 🚀 Submit logic
        document.getElementById(`submit-${requestId}`).addEventListener("click", async () => {

          if (!auth.currentUser) {
            alert("Please login first");
            return;
          }

          const donorName = document.getElementById(`name-${requestId}`).value;
          const donorEmail = document.getElementById(`email-${requestId}`).value;
          const donorAddress = document.getElementById(`address-${requestId}`).value;

          if (!donorName || !donorEmail || !donorAddress) {
            alert("Fill all fields");
            return;
          }

          try {
            const requestRef = doc(db, "requests", requestId);
            const requestSnap = await getDoc(requestRef);

            if (!requestSnap.exists()) {
              alert("Request not found");
              return;
            }

            if (requestSnap.data().status !== "open") {
              alert("Already taken!");
              return;
            }

            if (requestSnap.data().userId === auth.currentUser.uid) {
              alert("You can't donate to your own request!");
              return;
            }

            await addDoc(collection(db, "donations"), {
              requestId,
              itemName: data.itemName,
              donorId: auth.currentUser.uid,
              requesterId: data.userId,
              donorName,
              donorEmail,
              donorAddress,
              status: "pending",
              createdAt: new Date()
            });

           await updateDoc(requestRef, {
              status: "matched"
            });

            alert("Donation submitted!");
            loadRequests();

          } catch (error) {
            console.error(error);
            alert("Error submitting donation");
          }

        }); // ✅ submit listener closed

      } // ✅ if closed
    }

    }); // ✅ forEach closed

  } catch (error) {
    console.error("Error loading requests:", error);
  }

} // ✅ function closed
window.addEventListener("DOMContentLoaded", loadRequests);