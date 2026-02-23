// ImportButton.jsx
import { collection, addDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import menuData from "./menuData.json";

function ImportButton() {

  const importData = async () => {
    try {
      const promises = menuData.map(item =>
        addDoc(collection(db, "menus"), {
          ...item,
          created_at: new Date()
        })
      );

    // const promises = menuData.map(item =>
    //     setDoc(
    //       doc(db, "menus", item.id.toString()),
    //       {
    //         ...item,
    //         created_at: new Date()
    //       }
    //     )
    //   );

      await Promise.all(promises);

      alert("Import สำเร็จ");

    } catch (error) {
      console.error(error);
      alert("Import ไม่สำเร็จ");
    }
  };
  
  return (
    <button onClick={importData}>
      Import Menu
    </button>
  );
}

export default ImportButton;