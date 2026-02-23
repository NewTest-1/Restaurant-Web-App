import { useEffect, useState } from "react"
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import "./tables.css"

export default function Tables() {

    const [tables, setTables] = useState([])
    const [selectedTable, setSelectedTable] = useState(null)
    const [orders, setOrders] = useState([])

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "tables"), (snapshot) => {
            setTables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        })
        return unsub
    }, [])

    useEffect(() => {
        if (!selectedTable) return
        const q = query(collection(db, "orders"), where("tableId", "==", selectedTable.id))
        const unsub = onSnapshot(q, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        })
        return unsub
    }, [selectedTable])

    const total = orders.reduce((sum, order) => sum + order.total, 0)

    const clearTable = async () => {
        await updateDoc(doc(db, "tables", selectedTable.id), { status: true })
        setOrders([])
        setSelectedTable(null)
    }

    return (
        <div className="tables-container">
            <h1 className="tables-title">🪑 จัดการโต๊ะ</h1>
            <div className="tables-grid">
                {tables.map(table => (
                    <div key={table.id} className={`table-card ${table.status ? "available" : "occupied"}`} onClick={() => setSelectedTable(table)}>
                        <div className="table-name">โต๊ะ {table.table_no}</div>
                        <div className={`table-status ${table.status ? "available" : "occupied"}`}>
                            {table.status ? "ว่าง" : "ไม่ว่าง"}
                        </div>
                    </div>
                ))}
            </div>

            {selectedTable && (
                <div className="orders-panel">
                    <h2>ออเดอร์ โต๊ะ {selectedTable.table_no}</h2>

                    {orders.length === 0 && <div className="no-orders">ยังไม่มีออเดอร์</div>}

                    {orders.map(order => (
                        <div key={order.id} className="order-box">
                            {order.items.map(item => (
                                <div key={item.id} className="order-item">
                                    {item.name} × {item.qty}
                                </div>
                            ))}
                            <div className="order-total">฿ {order.total}</div>
                        </div>
                    ))}

                    <div className="grand-total">รวมทั้งหมด ฿ {total}</div>
                    <button className="clear-btn" onClick={clearTable}>
                        เคลียร์โต๊ะ
                    </button>
                </div>
            )}

        </div>
    )
}