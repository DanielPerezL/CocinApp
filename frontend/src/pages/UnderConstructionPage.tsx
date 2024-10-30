import React from "react";
import { useNavigate } from "react-router-dom";

const UnderConstruction: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

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
        <button className="btn btn-primary" onClick={handleBackToHome}>
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default UnderConstruction;
