import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  query,
  where
} from "firebase/firestore";

import { db } from "../firebase";
import "./pos.css";

export default function POS() {

  const [menus, setMenus] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false)

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    loadMenus();
    loadTables();
  }, []);

  // โหลด order เมื่อเลือกโต๊ะ
  useEffect(() => {
    if (selectedTable)
      loadOrder(selectedTable.id);
  }, [selectedTable]);

  // โหลด menus
  const loadMenus = async () => {

    const snap = await getDocs(collection(db, "menus"));

    setMenus(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );

  };

  // โหลด tables
  const loadTables = async () => {

    const snap = await getDocs(collection(db, "tables"));

    setTables(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );

  };

  // โหลด order ของโต๊ะ
  const loadOrder = async (tableId) => {

    const q = query(
      collection(db, "orders"),
      where("tableId", "==", tableId),
      where("status", "==", "pending")
    );

    const snap = await getDocs(q);

    if (!snap.empty) {

      const order = snap.docs[0];

      setCurrentOrder({
        id: order.id,
        ...order.data()
      });

      setCart(order.data().items);

    } else {
      setCurrentOrder(null);
      setCart([]);
    }
  };

  // เพิ่มสินค้า
  const addToCart = (menu) => {
    const exist = cart.find(i => i.id === menu.id);
    if (exist) {
      setCart(
        cart.map(i =>
          i.id === menu.id
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      );

    } else {

      setCart([
        ...cart,
        {
          id: menu.id,
          name: menu.name,
          price: menu.price,
          qty: 1
        }
      ]);

    }

  };

  // ลบสินค้า
  const removeItem = (menuId) => {
    setCart(
      cart
        .map(i =>
          i.id === menuId
            ? { ...i, qty: i.qty - 1 }
            : i
        )
        .filter(i => i.qty > 0)
    );
  };

  // คำนวณ total
  const total = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  // ส่ง order
  const createOrder = async () => {
    if (!selectedTable) {
      alert("เลือกโต๊ะก่อน");
      return;
    }
    if (cart.length === 0) {
      alert("ไม่มีสินค้า");
      return;
    }

    // create new order
    if (!currentOrder) {
      await addDoc(collection(db, "orders"), {
        // tableId: selectedTable.id,
        table_no: selectedTable.table_no,
        items: cart,
        total,
        status: "pending",
        status_paid: "not_paid",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    // update existing order
    else {

      await updateDoc(
        doc(db, "orders", currentOrder.id),
        {
          items: cart,
          total
        }
      );

    }

    // update table status
    await updateDoc(
      doc(db, "tables", selectedTable.id),
      {
        status: "occupied"
      }
    );

    alert("ส่งเข้าครัวสำเร็จ");

  };

  const downloadQR = () => {
    if (!selectedTable?.qr) {
      alert("ไม่มี QR")
      return
    }
    const link = document.createElement("a")
    link.href = selectedTable.qr
    link.download = `table-${selectedTable.table_no}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="pos-container">
      {/* TABLES */}
      <div className="tables-panel">
        <h2>โต๊ะ</h2>
        
        <div className="tables-grid">
          <button onClick={() => setShowQRModal(true)} className="preview-qr-btn" >
            Preview QR
          </button>

          {tables.map(t => (
            <div
              key={t.id}
              className={
                `table-card
                ${selectedTable?.id === t.id ? "active" : ""}
                ${t.status === "occupied" ? "occupied" : ""}`
              }
              onClick={() => setSelectedTable(t)}
            >
              {t.table_no}
            </div>
          ))}
        </div>

        {showQRModal && selectedTable?.qr && (
          <div className="qr-modal-overlay">
            <div className="qr-modal">
              <h3>QR โต๊ะ {selectedTable.table_no}</h3>
              <img src={selectedTable.qr} className="qr-modal-image" />
              <button onClick={downloadQR} className="download-btn" >Download</button>
              <button onClick={() => setShowQRModal(false)} className="close-btn" >
                Close
              </button>
            </div>
          </div>
        )}


      </div>


      {/* MENUS */}
      <div className="menus-panel">
        <h2>เมนู</h2>
        <div className="menu-grid-pos">
          {menus.map(menu => (
            <div
              key={menu.id}
              className="menu-card-pos"
              onClick={() => addToCart(menu)}
            >

              {menu.image && (
                <img
                  src={menu.image}
                  alt={menu.name}
                />
              )}

              <h3>{menu.name}</h3>

              <p>{menu.price} บาท</p>

            </div>

          ))}

        </div>

      </div>


      {/* CART */}
      <div className="cart-panel">
        <h2>
          Cart
          <br />
          {selectedTable?.table_no}
        </h2>
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item-pos">
              <span>
                {item.name}
              </span>
              <span>
                {item.qty} x {item.price}
              </span>
              <button onClick={() => removeItem(item.id)}>
                -
              </button>

            </div>

          ))}

        </div>
        {/* <div className="cart-footer" >
          <div className="total">
            รวม {total} บาท
          </div>
          <button className="send-btn" onClick={createOrder}>
            ส่งเข้าครัว
          </button>
        </div> */}
        <div className="pos-cart-footer">
          <div className="cart-total">
            <span >ยอดรวมทั้งหมด:</span>
            <span >฿{total}</span>
          </div>
          <button className="checkout-btn" onClick={createOrder}>
            ส่งเข้าครัว
          </button>
        </div>
      </div>
    </div>
  );
}