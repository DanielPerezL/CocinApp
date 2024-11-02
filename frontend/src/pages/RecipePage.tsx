// src/pages/RecipePage.tsx
import React from "react";
import RecipeDetails from "../components/RecipeDetails";
import { RecipeDetailsDTO } from "../interfaces";

let ejemploRecipe: RecipeDetailsDTO = {
  id: 0,
  title: "Paella Valenciana",
  images: [
    "https://via.placeholder.com/100x100",
    "https://via.placeholder.com/300x200",
    "https://via.placeholder.com/300x300",
  ],
  ingredientes:
    "Arroz\npollo\nconejo\njudías verdes\ngarrofón\naceite de oliva\nazafrán\nsal\nagua.",
  procedimiento: "1. Calentar el aceite en una paellera... etc.",
};

const RecipePage = () => {
  return <RecipeDetails recipe={ejemploRecipe} />;
};

export default RecipePage;
