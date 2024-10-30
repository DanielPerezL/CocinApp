// src/components/RecetaCard.tsx
import React from "react";
import "../css/RecetaCard.css";

interface RecetaProps {
  titulo: string;
  imagen: string;
}

const RecetaCard: React.FC<RecetaProps> = ({ titulo, imagen }) => {
  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      {/* Clases Bootstrap directamente en RecetaCard */}
      <div className="card h-100">
        <img src={imagen} className="card-img-top receta-img" alt={titulo} />
        <div className="card-body">
          <h6 className="card-title">{titulo}</h6>
        </div>
      </div>
    </div>
  );
};

export default RecetaCard;
