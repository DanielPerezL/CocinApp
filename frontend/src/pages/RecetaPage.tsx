// src/pages/RecetaPage.tsx
import React from "react";
import RecetaDetails from "../components/RecetaDetails";

const ejemploReceta = {
  titulo: "Paella Valenciana",
  imagenes: [
    "https://via.placeholder.com/100x100",
    "https://via.placeholder.com/300x200",
    "https://via.placeholder.com/300x300",
  ],
  ingredientes:
    "Arroz\npollo\nconejo\njudías verdes\ngarrofón\naceite de oliva\nazafrán\nsal\nagua.",
  procedimiento: "1. Calentar el aceite en una paellera... etc.",
};

const RecetaPage = () => {
  return <RecetaDetails {...ejemploReceta} />;
};

export default RecetaPage;
