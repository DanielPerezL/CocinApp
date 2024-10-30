// src/components/RecetaDetails.tsx
import React from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecetaDetails.css";

interface RecetaDetailsProps {
  titulo: string;
  imagenes: string[];
  ingredientes: string;
  procedimiento: string;
}

const RecetaDetails: React.FC<RecetaDetailsProps> = ({
  titulo,
  imagenes,
  ingredientes,
  procedimiento,
}) => {
  return (
    <div className="container my-5 main-container">
      <h1 className="display-5 text-primary mb-4">{titulo}</h1>

      {/* Carrusel de imágenes */}
      <ImageCarousel imagenes={imagenes} />

      {/* Sección de ingredientes */}
      <div className="mb-4">
        <h3>Ingredientes</h3>
        <p className="receta-text">{ingredientes}</p>
      </div>

      {/* Sección de procedimiento */}
      <div className="mb-4">
        <h3>Procedimiento</h3>
        <p className="receta-text">{procedimiento}</p>
      </div>
    </div>
  );
};

export default RecetaDetails;
