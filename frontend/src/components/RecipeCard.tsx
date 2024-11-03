// src/components/RecipeCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { RecipeSimpleDTO } from "../interfaces";
import "../css/RecipeCard.css";

interface RecipeCardProps {
  recipe: RecipeSimpleDTO;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link
      to={"/recipe?id=" + recipe.id}
      className="col-6 col-md-4 col-lg-3 mb-4"
      onClick={() => {
        window.scrollTo(0, 0);
      }}
    >
      <div className="card h-100">
        <img
          src={recipe.image}
          className="card-img-top recipe-img"
          alt={recipe.title}
        />
        <div className="card-body">
          <h6 className="card-title text-white">{recipe.title}</h6>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
