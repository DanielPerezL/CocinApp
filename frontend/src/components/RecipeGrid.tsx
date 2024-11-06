// src/components/RecipesGrid.tsx
import React from "react";
import RecipeCard from "./RecipeCard"; // Asegúrate de importar correctamente tu componente
import { RecipeSimpleDTO } from "../interfaces";

interface RecipesGridProps {
  recipes: RecipeSimpleDTO[];
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
