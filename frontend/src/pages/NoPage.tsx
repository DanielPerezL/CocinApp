import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NoPage: React.FC = () => {
  return (
    <div className="d-flex align-items-center justify-content-center main-container">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <p className="fs-3">
          <span className="text-danger">Oops!</span> Página no encontrada.
        </p>
        <p className="lead">
          La página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="btn btn-primary"
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NoPage;
