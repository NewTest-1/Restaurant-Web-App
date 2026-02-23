import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import menuData from "./menuData.json" assert { type: "json" };


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// const firebaseConfig = {
//   apiKey: "...",
//   authDomain: "...",
//   projectId: "restaurant-liff"
// };

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