// src/components/RecetasGrid.tsx
import React from "react";
import RecetaCard from "./RecetaCard"; // Asegúrate de importar correctamente tu componente
import { RecetaGridDTO } from "../App";
import { Link } from "react-router-dom";

interface RecetasGridProps {
  recetas: RecetaGridDTO[];
}

const RecetasGrid: React.FC<RecetasGridProps> = ({ recetas }) => {
  return (
    <div className="row">
      {recetas.map((receta, index) => (
        <RecetaCard key={index} receta={receta} />
      ))}
    </div>
  );
};

export default RecetasGrid;
