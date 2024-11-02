// src/components/RecipesGrid.tsx
import React from "react";
import RecipeCard from "./RecipeCard"; // Asegúrate de importar correctamente tu componente
import { RecipeGridDTO } from "../interfaces";
import { Link } from "react-router-dom";

interface RecipesGridProps {
  recipes: RecipeGridDTO[];
}

const RecipeGrid: React.FC<RecipesGridProps> = ({ recipes }) => {
  return (
    <div className="row">
      {recipes.map((recipe, index) => (
        <RecipeCard key={index} recipe={recipe} />
      ))}
    </div>
  );
};

export default RecipeGrid;
