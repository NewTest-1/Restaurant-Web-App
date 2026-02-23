import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";
import "./kitchen.css";

export default function Kitchen() {

  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  // realtime listener
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(data);

    });

    return unsubscribe;

  }, []);


  // default status อัตโนมัติ
  useEffect(() => {
    if (orders.length === 0) return;

    const hasPending =
      orders.some(o =>
        (o.status || "pending") === "pending"
      );

    if (hasPending) {
      setSelectedStatus("pending");
    } else {
      setSelectedStatus("ทั้งหมด");
    }

  }, [orders]);

  // mark cooking
  const markCooking = async (id) => {
    await updateDoc(
      doc(db, "orders", id),
      {
        status: "cooking",
        updatedAt: serverTimestamp()
      }
    );

  };

  // mark done
  const markDone = async (id) => {
    await updateDoc(
      doc(db, "orders", id),
      {
        status: "done",
        updatedAt: serverTimestamp()
      }
    );

  };

  // filter status
  const filtered =
    selectedStatus === "ทั้งหมด"
      ? orders
      : orders.filter(
        o =>
          (o.status || "pending") === selectedStatus
      );

  // sort: pending ก่อน → ใหม่สุดก่อน
  const sorted = [...filtered].sort((a, b) => {
    const statusA = a.status || "pending";
    const statusB = b.status || "pending";

    if (statusA !== statusB) {
      if (statusA === "pending") return -1;
      if (statusB === "pending") return 1;
    }

    return (
      b.updatedAt?.toDate() -
      a.updatedAt?.toDate()
    );
  });

  // group by table
  const groupByTable = (orders) => {
    const result = {};
    orders.forEach(order => {
      const table =
        order.table_no || "unknown";

      if (!result[table])
        result[table] = [];

      result[table].push(order);
    });
    return result;
  };

  const grouped = groupByTable(sorted);


  // status เรียงคงที่
  const statusLabels = {
    pending: "รอทำอาหาร",
    cooking: "กำลังทำอาหาร",
    done: "เสร็จแล้ว",
    ทั้งหมด: "ทั้งหมด"
  };
  
  const statuses = [
    "ทั้งหมด",
    "pending",
    "cooking",
    "done"
  ].filter(status => {
    if (status === "ทั้งหมด") return true;
    return orders.some(o =>
      (o.status || "pending") === status
    );

  });


  return (
    <div className="kitchen-container">

      <h1 className="kitchen-title">
        👨‍🍳 Kitchen
      </h1>

      {/* status tabs */}
      <div className="status-tabs">

        {statuses.map(status => (

          <button
            key={status}
            className={
              selectedStatus === status
                ? "tab active"
                : "tab"
            }
            onClick={() =>
              setSelectedStatus(status)
            }
          >
            {statusLabels[status] || status}
          </button>

        ))}

      </div>

      {/* kanban board */}
      <div className="kitchen-kanban">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([table, orders]) => (
          <div key={table} className="table-column">
            <div className="table-header">
              🪑 โต๊ะ {table}
              <span>{orders.length}</span>
            </div>
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className={`order-card ${order.status}`}>
                  <div className="order-time">
                    {order.updatedAt
                      ?.toDate()
                      ?.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                  </div>

                  <div className="order-items">
                    {order.items.map(item => (
                      <div
                        key={item.id}
                        className="order-item"
                      >
                        {item.name} × {item.qty}
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <div className="total">
                      ฿ {order.total}
                    </div>

                    {order.status === "pending" && (
                      <button className="done-btn pending" onClick={() => markCooking(order.id)}>
                        รอทำอาหาร
                      </button>
                    )}
                    {order.status === "cooking" && (
                      <button className="done-btn" onClick={() => markDone(order.id)}>
                        เสร็จแล้ว
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}