import React, { useState } from "react";
import logo from "../assets/logo.png"; // Ajusta la ruta según tu estructura
import icon from "../assets/icon.png";
import NavButtons from "./NavButtons"; // Importa el componente NavButtons
import "../css/Navbar.css"; // Archivo CSS para estilos personalizados
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navegamos a la ruta /search con el query como parámetro de búsqueda
    navigate(`/search?title=${searchTitle}`);
  };

  return (
    <nav className="navbar bg-primary">
      <div className="container" style={{ maxWidth: "1400px" }}>
        <div className="d-flex align-items-center w-100">
          <Link
            to="/"
            className="btn"
            title="CocinApp"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img src={icon} className="icon-img d-block d-sm-none" />
            <img src={logo} className="logo-img d-none d-sm-block" />
          </Link>
          <div className="mx-2 flex-grow-1">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder={t("searchPlaceHolder")}
                name="search-input"
                className="form-control search-input"
                value={searchTitle}
                onChange={handleSearchChange}
              />
            </form>
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
