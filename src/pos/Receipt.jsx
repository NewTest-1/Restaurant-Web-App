// export default function Receipt({ order }) {

//     return (
//         <div className="receipt">
//             {order.items.map(item => (

//                 <div key={item.id} className="receipt-row">

//                     <span>
//                         {item.qty} × {item.name}
//                     </span>

//                     <span>
//                         ฿ {item.price * item.qty}
//                     </span>

//                 </div>

//             ))}
//             <div className="receipt-total">
//                 <span>Total</span>
//                 <span>฿ {order.total}</span>
//             </div>
//         </div>

//     )

// }



// export default function Receipt({ table , order }) {

//     return (
//         <div className="receipt">
//             {order.items.map(item => (
//                 <div key={item.id} className="receipt-row">
//                     <span>{item.qty} × {item.name}</span>
//                     <span>฿ {item.price * item.qty}</span>
//                 </div>
//             ))}
//         </div>

//     )
// }


import { useState } from "react"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "../firebase"
import './receipt.css';

export default function Receipt({ orders, table }) {

    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [loading, setLoading] = useState(false)

    // รวม items ทั้งหมด
    const allItems = orders.flatMap(order => order.items)

    // รวม total
    const total = orders.reduce((sum, order) => sum + order.total, 0)
    const handlePayment = async () => {

        setLoading(true)

        for (const order of orders) {

            await updateDoc(
                doc(db, "orders", order.id),
                {
                    status_paid: "paid",
                    payment_method: paymentMethod
                }
            )

        }

        setLoading(false)

    }

    return (

        <div className="receipt-card">

            <h2>ออเดอร์ โต๊ะ {table.table_no}</h2>

            {allItems.map((item, index) => (

                <div key={index} className="receipt-row">

                    <span>
                        {item.qty} x {item.name}
                    </span>

                    <span>
                        ฿ {item.qty * item.price}
                    </span>

                </div>

            ))}

            <hr />

            <div className="receipt-total">

                <span>Total</span>

                <span>฿ {total}</span>

            </div>


            {/* payment methods */}

            <div className="payment-methods">
                <button
                    className={paymentMethod === "cash" ? "pay-btn active" : "pay-btn"}
                    onClick={() => setPaymentMethod("cash")}
                >
                    💵 เงินสด
                </button>

                <button
                    className={paymentMethod === "promptpay" ? "pay-btn active" : "pay-btn"}
                    onClick={() => setPaymentMethod("promptpay")}
                >
                    📱 PromptPay
                </button>

                <button
                    className={paymentMethod === "card" ? "pay-btn active" : "pay-btn"}
                    onClick={() => setPaymentMethod("card")}
                >
                    💳 บัตร
                </button>

            </div>

            <div className="receipt-footer">            
                <button className="pay-btn-main" onClick={handlePayment} disabled={loading} >
                    {loading ? "กำลังชำระเงิน..." : "ชำระเงิน"}
                </button>
            </div>

        </div>

    )

}