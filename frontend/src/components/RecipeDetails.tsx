// src/components/RecipeDetails.tsx
import React from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecipeDetails.css";
import { RecipeDetailsDTO } from "../interfaces";

interface RecipeDetailsProps {
  recipe: RecipeDetailsDTO;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe }) => {
  return (
    <div className="container my-5 main-container">
      <h1 className="display-5 text-primary mb-4">{recipe.title}</h1>

      {/* Carrusel de imágenes */}
      <ImageCarousel images={recipe.images} />

      {/* Sección de ingredientes */}
      <div className="mb-4">
        <h3>Ingredientes</h3>
        <p className="receta-text">{recipe.ingredientes}</p>
      </div>

      {/* Sección de procedimiento */}
      <div className="mb-4">
        <h3>Procedimiento</h3>
        <p className="receta-text">{recipe.procedimiento}</p>
      </div>
    </div>
  );
};

export default RecipeDetails;
