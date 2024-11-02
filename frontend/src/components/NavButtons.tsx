import React from "react";
import { Link } from "react-router-dom"; // Importa Link desde react-router-dom
import corazon from "../assets/corazon.png";
import cesta from "../assets/cesta.png";
import publicar from "../assets/publicar.png";
import usuario from "../assets/usuario.png";

const NavButtons: React.FC = () => {
  return (
    <div className="d-flex justify-content-around">
      <Link
        to="/favoritas"
        className="btn nav-btn mx-1"
        title="Favoritos"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={corazon} alt="Favoritos" />
      </Link>
      {/*<Link to="/cesta" className="btn nav-btn mx-1" title="Cesta de la compra">
        <img src={cesta} alt="Cesta" />
      </Link>*/}
      <Link
        to="/publicar"
        className="btn nav-btn mx-1"
        title="Publicar receta"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={publicar} alt="Publicar" />
      </Link>
      <Link
        to="/perfil"
        className="btn nav-btn mx-1"
        title="Perfil"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={usuario} alt="Perfil" />
      </Link>
    </div>
  );
};

export default NavButtons;
