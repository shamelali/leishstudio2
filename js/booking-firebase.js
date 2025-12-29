// booking-firebase.js
import { db } from "./firebase.js";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Check for conflicts in Firestore
async function checkConflicts(space, start, end) {
  const bookingsRef = collection(db, "bookings");
  const q = query(
    bookingsRef,
    where("space_name", "in", [space, "Full House"]),
    where("start_time", "<", end.toISOString()),
    where("end_time", ">", start.toISOString())
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Handle booking submission
export async function handleBooking() {
  const name = document.getElementById("muaName").value;
  const space = document.getElementById("spaceSelect").value;
  const date = document.getElementById("bookDate").value;
  const time = document.getElementById("bookTime").value;
  const dur = parseInt(document.getElementById("duration").value);

  if (!name || !date || !time || !dur) {
    document.getElementById("status").textContent = "⚠️ Please fill in all fields.";
    return;
  }

  const start = new Date(`${date}T${time}`);
  const end = new Date(start.getTime() + dur * 3600000 + 15 * 60000);

  const conflict = await checkConflicts(space, start, end);
  if (conflict) {
    document.getElementById("status").textContent = "❌ Slot Occupied.";
    return;
  }

  await addDoc(collection(db, "bookings"), {
    client_name: name,
    space_name: space,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    created_at: new Date().toISOString(),
    status: "confirmed"
  });

  document.getElementById("status").textContent = "✅ Booking confirmed — opening WhatsApp...";
  const msg = `✨ Leish Studio Booking ✨\nName: ${name}\nSpace: ${space}\nDate: ${date}\nTime: ${time}\nDuration: ${dur} hrs`;
  window.open(`https://wa.me/60123456789?text=${encodeURIComponent(msg)}`);
}

// Attach event listener to form
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await handleBooking();
});