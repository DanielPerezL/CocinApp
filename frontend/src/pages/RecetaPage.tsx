// src/pages/RecetaPage.tsx
import React from "react";
import RecetaDetails from "../components/RecetaDetails";
import { RecetaDetailsDTO } from "../App";

let ejemploReceta: RecetaDetailsDTO = {
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

const RecetaPage = () => {
  return <RecetaDetails receta={ejemploReceta} />;
};

export default RecetaPage;
