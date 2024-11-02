// src/components/RecetaDetails.tsx
import React from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecetaDetails.css";
import { RecetaDetailsDTO } from "../App";

interface RecetaDetailsProps {
  receta: RecetaDetailsDTO;
}

const RecetaDetails: React.FC<RecetaDetailsProps> = ({ receta }) => {
  return (
    <div className="container my-5 main-container">
      <h1 className="display-5 text-primary mb-4">{receta.title}</h1>

      {/* Carrusel de imágenes */}
      <ImageCarousel imagenes={receta.images} />

      {/* Sección de ingredientes */}
      <div className="mb-4">
        <h3>Ingredientes</h3>
        <p className="receta-text">{receta.ingredientes}</p>
      </div>

      {/* Sección de procedimiento */}
      <div className="mb-4">
        <h3>Procedimiento</h3>
        <p className="receta-text">{receta.procedimiento}</p>
      </div>
    </div>
  );
};

export default RecetaDetails;
