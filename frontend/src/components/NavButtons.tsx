import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heart from "../assets/heart.png";
import cart from "../assets/cart.png";
import publish from "../assets/publish.png";
import user from "../assets/user.png";
import report from "../assets/report.png";
import magnifyingGlass from "../assets/magnifying-glass.png";
import { isAdmin, isLoggedIn } from "../services/apiService";
import { authEvents } from "../events/authEvents";
import { useTranslation } from "react-i18next";

const NavButtons: React.FC = () => {
  const { t } = useTranslation();

  const [update, setUpdate] = useState(0); // Estado para forzar re-render

  useEffect(() => {
    const handleAuthChange = () => {
      setUpdate((prev) => prev + 1); // Cambia el estado para repintar el componente
    };

    // Escucha los eventos de login y logout
    authEvents.on("login", handleAuthChange);
    authEvents.on("logout", handleAuthChange);

    return () => {
      // Limpia los listeners al desmontar el componente
      authEvents.off("login", handleAuthChange);
      authEvents.off("logout", handleAuthChange);
    };
  }, []);

  return (
    <div className="d-flex justify-content-around">
      {isLoggedIn() && (
        <>
          <Link
            to="/favorites"
            title={t("favoritesList")}
            className="btn nav-btn mx-1"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img src={heart} />
          </Link>
          <Link
            to="/cart"
            title={t("cartList")}
            className="btn nav-btn mx-1"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img src={cart} />
          </Link>
          <Link
            to="/publish"
            title={t("publishRecipe")}
            className="btn nav-btn mx-1"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img src={publish} />
          </Link>
        </>
      )}

      {isAdmin() && (
        <Link
          to="/reports"
          title={t("reports")}
          className="btn nav-btn mx-1"
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          <img src={report} />
        </Link>
      )}

      <Link
        to="/search"
        title={t("searchRecipes")}
        className="btn nav-btn mx-1"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={magnifyingGlass} />
      </Link>
      <Link
        to="/profile"
        title={t("userProfile")}
        className="btn nav-btn mx-1"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={user} />
      </Link>
    </div>
  );
};

export default NavButtons;
