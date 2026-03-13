import { Link, Routes, Route } from "react-router";
import { Home } from "./pages/home";
import { About } from "./pages/about";

export const App = () => (
  <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 480, margin: "0 auto" }}>
    <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
      <Link to="/" style={{ color: "#4a90d9", textDecoration: "none", fontSize: 14 }}>
        Home
      </Link>
      <Link to="/about" style={{ color: "#4a90d9", textDecoration: "none", fontSize: 14 }}>
        About
      </Link>
    </nav>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </div>
);
