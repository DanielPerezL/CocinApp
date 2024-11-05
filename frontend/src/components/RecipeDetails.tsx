// src/components/RecipeDetails.tsx
import React from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecipeDetails.css";
import { RecipeDetailDTO } from "../interfaces";

interface RecipeDetailsProps {
  recipe: RecipeDetailDTO;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe }) => {
  return (
    <div className="container my-5 main-container">
      <h1 className="display-5 text-primary mb-4">{recipe.title}</h1>

      {/* Carrusel de imágenes */}
      <ImageCarousel
        images={
          Array.isArray(recipe.images)
            ? recipe.images
            : recipe.images.split(",")
        }
      />

      {/* Sección de ingredientes */}
      <div className="mb-4">
        <h3>Ingredientes</h3>
        <p className="receta-text">{recipe.ingredients}</p>
      </div>

      {/* Sección de procedimiento */}
      <div className="mb-4">
        <h3>Procedimiento</h3>
        <p className="receta-text">{recipe.procedure}</p>
      </div>
    </div>
  );
};

export default RecipeDetails;
