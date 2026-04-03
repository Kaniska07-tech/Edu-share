import { db, auth } from "./firebase.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
document.getElementById("submitBtn").addEventListener("click", submitRequest);
async function submitRequest() {
  const itemName = document.getElementById("itemName").value;
  const subject = document.getElementById("subject").value;
  const location = document.getElementById("location").value;

  try {
    await addDoc(collection(db, "requests"), {
      itemName,
      subject,
      location,
      userId: auth.currentUser.uid,
      status: "open",
      createdAt: new Date()
    });

    document.getElementById("requestSuccess").innerText =
      "Request submitted successfully!";

  } catch (error) {
    console.error(error);
    alert("Error submitting request");
  }
}