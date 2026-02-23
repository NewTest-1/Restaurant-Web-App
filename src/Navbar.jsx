import { NavLink } from "react-router-dom"
import "./navbar.css"

export default function Navbar() {

    return (
        <div className="navbar">
            <div className="nav-left">
                🍜 Restaurant POS
            </div>
            <div className="nav-right">
                <NavLink
                    to="/restaurant" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                    Restaurant
                </NavLink>
                <NavLink
                    to="/" className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}>
                    POS
                </NavLink>

                <NavLink
                    to="/kitchen"
                    className={({ isActive }) =>
                        isActive ? "nav-btn active" : "nav-btn"
                    }
                >
                    Kitchen
                </NavLink>

                <NavLink
                    to="/tables"
                    className={({ isActive }) =>
                        isActive ? "nav-btn active" : "nav-btn"
                    }
                >
                    Tables
                </NavLink>

            </div>

        </div>
    )

}