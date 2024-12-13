// src/components/RecipeCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { RecipeSimpleDTO } from "../interfaces";
import "../css/RecipeCard.css";
import { getImage } from "../services/apiService";
import { useTranslation } from "react-i18next";

interface RecipeCardProps {
  recipe: RecipeSimpleDTO;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={"/recipe?id=" + recipe.id}
      className="text-start col-6 col-md-4 col-lg-3 mb-4"
      onClick={() => {
        window.scrollTo(0, 0);
      }}
    >
      <div className="card h-100">
        <img
          src={getImage(recipe.image)}
          className="card-img-top recipe-img"
          alt={recipe.title}
        />
        <div className="card-body">
          <span className="badge bg-info mb-1 me-1">{t(recipe.time)}</span>
          <span className="badge bg-warning text-dark mb-1">
            {t(recipe.difficulty)}
          </span>
          <h6 className="card-title text-white">{recipe.title}</h6>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
