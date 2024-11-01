// src/components/Navbar.tsx
import React from "react";
import logo from "../assets/logo.png"; // Ajusta la ruta según tu estructura
import icono from "../assets/icono.png";
import NavButtons from "./NavButtons"; // Importa el componente NavButtons
import "../css/ Navbar.css"; // Archivo CSS para estilos personalizados
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <>
      {/* Barra de navegación superior */}
      <nav className="navbar navbar-expand-lg top-nav bg-light p-2">
        <div className="container-fluid">
          <div className="logo-container d-flex align-items-center">
            <img src={logo} alt="Logo de CocinApp" className="logo-img me-2" />
            <img src={icono} alt="Icono de CocinApp" className="icono-img" />
          </div>
          <div className="search-container flex-grow-1 mx-3">
            <input
              type="text"
              placeholder="Buscar recetas..."
              className="form-control search-input"
            />
          </div>
          {/* Uso del componente NavButtons */}
          <NavButtons />
        </div>
      </nav>

      {/* Barra de navegación inferior */}
      <nav className="bottom-nav d-lg-none bg-light p-2">
        {/* Uso del componente NavButtons */}
        <NavButtons />
      </nav>
    </>
  );
};

export default Navbar;
