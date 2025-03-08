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
    <div
      className="d-flex justify-content-around"
      role="navigation"
      aria-label={t("mainNavigation")}
    >
      {isLoggedIn() && (
        <>
          <Link
            to="/favorites"
            className="btn nav-btn mx-1"
            onClick={() => window.scrollTo(0, 0)}
            aria-label={t("favoritesList")}
          >
            <img src={heart} alt={t("favoritesList")} />
          </Link>
          <Link
            to="/cart"
            className="btn nav-btn mx-1"
            onClick={() => window.scrollTo(0, 0)}
            aria-label={t("cartList")}
          >
            <img src={cart} alt={t("cartList")} />
          </Link>
          <Link
            to="/publish"
            className="btn nav-btn mx-1"
            onClick={() => window.scrollTo(0, 0)}
            aria-label={t("publishRecipe")}
          >
            <img src={publish} alt={t("publishRecipe")} />
          </Link>
        </>
      )}

      {isAdmin() && (
        <Link
          to="/reports"
          className="btn nav-btn mx-1"
          onClick={() => window.scrollTo(0, 0)}
          aria-label={t("reports")}
        >
          <img src={report} alt={t("reports")} />
        </Link>
      )}

      <Link
        to="/search"
        className="btn nav-btn mx-1"
        onClick={() => window.scrollTo(0, 0)}
        aria-label={t("searchRecipes")}
      >
        <img src={magnifyingGlass} alt={t("searchRecipes")} />
      </Link>
      <Link
        to="/profile"
        className="btn nav-btn mx-1"
        onClick={() => window.scrollTo(0, 0)}
        aria-label={t("userProfile")}
      >
        <img src={user} alt={t("userProfile")} />
      </Link>
    </div>
  );
};

export default NavButtons;
