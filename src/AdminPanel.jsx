import React from "react";
import menuData from "./menuData.json";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function AdminPanel({ reloadMenu }) {

  const importMenu = async () => {

    if (!confirm("Import menu ทั้งหมด?")) return;

    try {

      for (const item of menuData) {

        await addDoc(collection(db, "menus"), item);

        console.log("Added:", item.name);
      }

      alert("Import สำเร็จ");

      reloadMenu();

    } catch (error) {

      console.error(error);

      alert("Import failed");
    }
  };

  const deleteAllMenus = async () => {

    if (!confirm("ลบเมนูทั้งหมด?")) return;

    try {

      const snapshot = await getDocs(collection(db, "menus"));

      for (const document of snapshot.docs) {

        await deleteDoc(doc(db, "menus", document.id));
      }

      alert("ลบทั้งหมดแล้ว");

      reloadMenu();

    } catch (error) {

      console.error(error);

      alert("Delete failed");
    }
  };

  return (

    <div style={{
      padding: "10px",
      background: "#222",
      borderBottom: "2px solid red",
      display: "flex",
      gap: "10px"
    }}>

      <button
        onClick={importMenu}
        style={buttonStyle}
      >
        Import Menu
      </button>

      <button
        onClick={deleteAllMenus}
        style={{ ...buttonStyle, background: "red" }}
      >
        Delete All
      </button>

      <button
        onClick={reloadMenu}
        style={{ ...buttonStyle, background: "blue" }}
      >
        Reload
      </button>

    </div>
  );
}

const buttonStyle = {

  padding: "8px 16px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};