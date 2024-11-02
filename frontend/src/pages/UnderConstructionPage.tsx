import React from "react";
import { Link } from "react-router-dom";

const UnderConstruction: React.FC = () => {
  return (
    <div className="d-flex align-items-center justify-content-center main-container mx-5">
      <div className="text-center">
        <h1 className="display-3 fw-bold text-warning">⚠️ En Desarrollo</h1>
        <p className="fs-4">
          Estamos trabajando para traerte una mejor experiencia.
        </p>
        <p className="lead">
          La página que intentas visitar aún está en construcción. Vuelve pronto
          para ver las novedades.
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

export default UnderConstruction;
