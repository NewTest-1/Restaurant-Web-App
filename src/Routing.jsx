import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"

import App from "./App"
import POS from "./pos/POS"
import Kitchen from "./pos/Kitchen"
import Table from "./pos/Table"
import Navbar from "./Navbar"
import "./index.css"


function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  // const { table } = useParams()
  const params = new URLSearchParams(location.search)
  const token = params.get("token")
  const table = params.get("table")
  const isFromQR = token !== null

  useEffect(() => {

    if (isFromQR && location.pathname.startsWith("/order")) {
      navigate(`/restaurant?table=${table}&token=${token}`, {
        replace: true
      })
    }
  }, [location])

  return (
    <div className="app-layout">
      {/* navbar */}
      {!isFromQR && <Navbar />}

      {/* content area */}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/restaurant" element={<App />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/tables" element={<Table />} />
        </Routes>
      </div>
    </div>
  )
}


export default function Routing() {

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )

}