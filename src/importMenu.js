import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import menuData from "./menuData.json" assert { type: "json" };

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "restaurant-liff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importData() {
  try {
    const promises = menuData.map(item =>
      addDoc(collection(db, "menus"), {
        ...item,
        created_at: new Date()
      })
    );

    await Promise.all(promises);

    console.log("Import done");

  } catch (error) {
    console.error("Import error:", error);
  }
}

importData();