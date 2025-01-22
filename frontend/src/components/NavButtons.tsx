import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importa Link desde react-router-dom
import heart from "../assets/heart.png";
import cart from "../assets/cart.png";
import publish from "../assets/publish.png";
import user from "../assets/user.png";
import report from "../assets/report.png";
import { isAdmin, isLoggedIn } from "../services/apiService";
import { authEvents } from "../events/authEvents";

const NavButtons: React.FC = () => {
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
            className="btn nav-btn mx-1"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img src={heart} />
          </Link>
          <Link
            to="/cart"
            className="btn nav-btn mx-1"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img src={cart} />
          </Link>
          <Link
            to="/publish"
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
          className="btn nav-btn mx-1"
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          <img src={report} />
        </Link>
      )}
      <Link
        to="/profile"
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
