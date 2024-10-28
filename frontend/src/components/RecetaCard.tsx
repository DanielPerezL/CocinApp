// src/components/RecetaCard.tsx
import React from "react";

interface RecetaProps {
  titulo: string;
  descripcion?: string;
}

const RecetaCard: React.FC<RecetaProps> = ({
  titulo,
  descripcion = "Descripción de la receta...",
}) => {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{titulo}</h5>
          <p className="card-text">{descripcion}</p>
        </div>
      </div>
    </div>
  );
};

export default RecetaCard;
