import React from "react";
import logo from "../assets/logo.png"; // Ajusta la ruta según tu estructura
import icono from "../assets/icono.png";
import NavButtons from "./NavButtons"; // Importa el componente NavButtons
import "../css/Navbar.css"; // Archivo CSS para estilos personalizados
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar bg-primary">
      <div className="container" style={{ maxWidth: "1400px" }}>
        <div className="d-flex align-items-center w-100">
          <Link to="/" className="btn" title="CocinApp">
            <img
              src={icono}
              alt="CocinApp icono"
              className="icono-img d-block d-sm-none"
            />
            <img
              src={logo}
              alt="CocinApp logo"
              className="logo-img d-none d-sm-block"
            />
          </Link>
          <div className="mx-2 flex-grow-1">
            <input
              type="text"
              placeholder="Buscar recetas..."
              name="search-input"
              className="form-control search-input"
            />
          </div>
          <div className="d-flex align-items-center d-none d-md-block">
            <NavButtons />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
