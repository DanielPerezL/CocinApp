import React from "react";
import { Link } from "react-router-dom"; // Importa Link desde react-router-dom
import heart from "../assets/heart.png";
import publish from "../assets/publish.png";
import user from "../assets/user.png";

const NavButtons: React.FC = () => {
  return (
    <div className="d-flex justify-content-around">
      <Link
        to="/favorites"
        className="btn nav-btn mx-1"
        title="Favoritos"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={heart} alt="Favoritos" />
      </Link>
      <Link
        to="/publish"
        className="btn nav-btn mx-1"
        title="publish receta"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={publish} alt="publish" />
      </Link>
      <Link
        to="/profile"
        className="btn nav-btn mx-1"
        title="Perfil"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={user} alt="Perfil" />
      </Link>
    </div>
  );
};

export default NavButtons;
