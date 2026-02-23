import { useParams, useSearchParams } from "react-router-dom"
import {
    doc,
    getDoc
} from "firebase/firestore"

const { tableNo } = useParams()

const [search] = useSearchParams()

const token = search.get("token")

useEffect(() => {

    verify()

}, [])

const verify = async () => {

    const ref = doc(db, "tables", tableNo)

    const snap = await getDoc(ref)

    if (!snap.exists()) {
        alert("table not found")
        return
    }

    const table = snap.data()

    if (table.token !== token) {

        alert("invalid QR")

        window.location = "/"

    }

}