import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore"
import { db } from "../firebase"
import Receipt from "./Receipt"
import { generateTableQR } from "./generateTableQR"
import "./tables.css"

export default function Tables() {

    const [tables, setTables] = useState([])
    const [selectedTable, setSelectedTable] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("cash")

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "tables"), (snapshot) => {
            setTables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        if (!selectedTable) return

        const q = query(
            collection(db, "orders"),
            where("table_no", "==", selectedTable.table_no),
            where("status_paid", "==", "not_paid")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        })

        return unsubscribe
    }, [selectedTable])

    // const clearTable = async () => {
    //     for (const order of orders) {
    //         await updateDoc(doc(db, "orders", order.id), {
    //             status_paid: "paid"
    //         })
    //     }
    // }

    const clearTable = async () => {
        if (!selectedTable) return
        try {
            // 1. ปิด order ทั้งหมดของโต๊ะนี้
            // for (const order of orders) {
            //     await updateDoc(
            //         doc(db, "orders", order.id),
            //         {
            //             status_paid: "paid"
            //         }
            //     )
            // }
            // 2. generate QR ใหม่
            const result = await generateTableQR(selectedTable.id)

            // 3. update table status
            await updateDoc(
                doc(db, "tables", selectedTable.id),
                {
                    status: "available"
                }
            )
            // 4. update UI
            setSelectedTable({
                ...selectedTable,
                status: "available",
                qr: result.qr,
                token: result.token
            })

            alert("เคลียร์โต๊ะสำเร็จ")

        } catch (err) {
            console.error(err)
            alert("เกิดข้อผิดพลาด")
        }
    }
    const total = orders.reduce((sum, order) => sum + order.total, 0)

    return (
        <div className="tables-layout">
            <div className="tables-left">
                <h1>จัดการโต๊ะ</h1>
                <div className="tables-grid">
                    {tables.map(table => (
                        <div
                            key={table.id}
                            className={`table-card 
                                ${selectedTable?.id === table.id ? "active" : ""} 
                                ${table.status === "occupied" ? "occupied" : ""}
                            `}
                            onClick={() => setSelectedTable(table)}
                        >
                            <div>โต๊ะ {table.table_no}</div>
                            <div className={`table-status ${table.status === "available" ? "available" : "occupied"}`}>
                                {table.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="tables-right">
                    {selectedTable && orders.length > 0 && (
                        <div> 
                            <Receipt orders={orders} table={selectedTable} />
                            <button className="clear-btn" onClick={clearTable} disabled={loading} >
                                {loading ? "กำลังเคลียร์..." : "เคลียร์โต๊ะ"}
                            </button>
                       </div>
                        
                    
                    )}

                {/* {selectedTable && (
                    <>
                        <h2>ออเดอร์ โต๊ะ {selectedTable.table_no}</h2>

                        <div className="receipt-wrapper">
                            {orders.map(order => (
                                <Receipt key={order.id} order={order} />
                            ))}
                        </div>

                        <div className="receipt-total">
                            <span>Total</span>
                            <span>฿ {total}</span>
                        </div>
                        <button 
                            className="clear-btn" 
                            onClick={clearTable}
                            disabled={loading}
                            >
                            {loading ? "กำลังเคลียร์..." : "เคลียร์โต๊ะ"}
                        </button>
                    </>
                )} */}
            </div>

        </div>
    )
}