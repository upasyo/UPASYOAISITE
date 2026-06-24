import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEnXq8c7W7ga3dJWF4EVUVJZ25aa8xreo",
  authDomain: "molten-tine-1dpgw.firebaseapp.com",
  projectId: "molten-tine-1dpgw",
  storageBucket: "molten-tine-1dpgw.firebasestorage.app",
  messagingSenderId: "757561179668",
  appId: "1:757561179668:web:93b60e2d0fb24252c6f101"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-5e90e300-b611-4604-9082-bc44d88c2d44");

async function run() {
  console.log("Checking and deleting 'hi' buttons...");
  const colRef = collection(db, "buttonLinks");
  const snap = await getDocs(colRef);
  let count = 0;
  console.log(`Found ${snap.docs.length} total button links.`);
  for (const d of snap.docs) {
    const data = d.data();
    console.log(`- Button link ID: ${d.id}, name: "${data.name}", url: "${data.url}"`);
    const name = (data.name || "").toLowerCase().trim();
    if (name === "hi" || name === "hi!") {
      console.log(`--> Deleting button link ID: ${d.id}, name: ${data.name}`);
      await deleteDoc(doc(db, "buttonLinks", d.id));
      count++;
    }
  }
  console.log(`Successfully deleted ${count} 'hi' buttons.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
