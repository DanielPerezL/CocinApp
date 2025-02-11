import React from "react";
import { Link } from "react-router-dom";
import { RecipeSimpleDTO } from "../interfaces";
import "../css/RecipeCard.css";
import { useTranslation } from "react-i18next";

interface RecipeCardProps {
  recipe: RecipeSimpleDTO;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={"/recipe?id=" + recipe.id}
      className="text-start recipe-grid col-sm-6 col-md-4 col-lg-3 mb-4"
      onClick={() => {
        window.scrollTo(0, 0);
      }}
    >
      <div className="card h-100">
        <img
          src={recipe.imageURL}
          className="card-img-top recipe-img"
          alt={recipe.title}
        />
        <div className="card-body">
          <span className="badge bg-primary">{t(recipe.time)}</span>{" "}
          <span className="badge bg-primary mb-1">{t(recipe.difficulty)}</span>
          <br />
          <h6 className="card-title d-inline-block text-white bg-dark bg-opacity-75 px-2 mb-0 rounded-2 w-100">
            {recipe.title}
          </h6>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
