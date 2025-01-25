import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png"; // Ajusta la ruta según tu estructura
import icon from "../assets/icon.png";
import NavButtons from "./NavButtons"; // Importa el componente NavButtons
import "../css/Navbar.css"; // Archivo CSS para estilos personalizados
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clearSearchEvents } from "../events/clearSearchEvents";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTitle(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate(`/search?title=${searchTitle}`);
  };

  const clearSearch = () => {
    setSearchTitle("");
    navigate(`/search`);
  };

  useEffect(() => {
    // Suscribirse al evento 'clearSearch'
    clearSearchEvents.on("clearSearch", clearSearch);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      clearSearchEvents.off("clearSearch", clearSearch);
    };
  }, []);

  return (
    <nav className="navbar bg-primary">
      <div className="container">
        <div className="d-flex align-items-center w-100">
          <Link
            to="/"
            className="btn"
            title="CocinApp"
            onClick={() => {
              window.scrollTo(0, 0);
              setSearchTitle("");
            }}
          >
            <img src={icon} className="icon-img d-block d-sm-none" />
            <img src={logo} className="logo-img d-none d-sm-block" />
          </Link>
          <div className="mx-2 flex-grow-1 position-relative">
            <form onSubmit={handleSearchSubmit} className="position-relative">
              <input
                type="text"
                placeholder={t("searchPlaceHolder")}
                name="search-input"
                className="form-control search-input pe-5"
                value={searchTitle}
                onChange={handleSearchChange}
              />
              {searchTitle && (
                <button
                  type="button"
                  className="btn-clear"
                  onClick={clearSearch}
                  aria-label={t("clearSearch")}
                >
                  |&times;
                </button>
              )}
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
