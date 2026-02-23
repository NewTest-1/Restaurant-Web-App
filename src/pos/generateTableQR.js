import { db } from "../firebase"
import {
    doc,
    updateDoc,
    getDoc
} from "firebase/firestore"

import QRCode from "qrcode"
import { v4 as uuidv4 } from "uuid"

export async function generateTableQR(tableId) {
    const tableRef = doc(db, "tables", tableId)
    const snap = await getDoc(tableRef)
    if (!snap.exists()) return
    const table = snap.data()
    // สร้าง token ใหม่ทุกครั้ง
    const token = uuidv4()
    // URL ใหม่
    const url =
        `${window.location.origin}/order?table=${table.table_no}&token=${token}`
        // `${window.location.origin}/restaurant}?token=${token}`

    // generate base64 QR
    const qr = await QRCode.toDataURL(url)
    // update firestore
    await updateDoc(tableRef, {
        token,
        qr
    })

    return {
        token,
        qr,
        url
    }

}