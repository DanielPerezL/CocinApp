import React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/receta">Receta</Link>
        </li>
      </ul>
    </nav>
  );
};
export default Navbar;
