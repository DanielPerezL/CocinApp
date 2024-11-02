// src/components/RecetaCard.tsx
import React from "react";
import { RecetaGridDTO } from "../App";
import "../css/RecetaCard.css";
import { Link } from "react-router-dom";

interface RecetaCardProps {
  receta: RecetaGridDTO;
}

const RecetaCard: React.FC<RecetaCardProps> = ({ receta }) => {
  return (
    <Link
      to={"/receta?id=" + receta.id}
      className="col-6 col-md-4 col-lg-3 mb-4"
      onClick={() => {
        window.scrollTo(0, 0);
      }}
    >
      <div className="card h-100">
        <img
          src={receta.image}
          className="card-img-top receta-img"
          alt={receta.title}
        />
        <div className="card-body">
          <h6 className="card-title">{receta.title}</h6>
        </div>
      </div>
    </Link>
  );
};

export default RecetaCard;
