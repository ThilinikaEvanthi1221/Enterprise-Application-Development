import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
