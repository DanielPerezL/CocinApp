// src/components/RecipeDetails.tsx
import React from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecipeDetails.css";
import { RecipeDetailDTO, UserPublicDTO } from "../interfaces";
import userPicture from "../assets/user.png";
import { Link } from "react-router-dom";

interface RecipeDetailsProps {
  recipe: RecipeDetailDTO;
  user: UserPublicDTO;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, user }) => {
  return (
    <div className="container my-5 main-container">
      <div className="d-flex justify-content-between align-items-center mb-4 recipe-nav-user">
        <div className="d-flex align-items-center ">
          <img
            src={userPicture}
            alt="User profile"
            className="rounded-circle me-3 recipe-nav-user-img"
          />
          {/* Contenedor limitado para truncamiento del nombre de usuario */}
          <div className="text-truncate" style={{ maxWidth: "150px" }}>
            <p className="my-0 text-primary text-truncate">{user.nickname}</p>
          </div>
        </div>

        <div className="d-flex justify-content-end align-items-center">
          <Link
            to="/favorites"
            className="btn recipe-nav-btn mx-1"
            title="Favoritos"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img src={userPicture} alt="Favoritos" />
          </Link>
          <button type="button" className="btn btn-primary">
            Seguir
          </button>
        </div>
      </div>

      <h1 className="display-5 text-primary mb-4">{recipe.title}</h1>
      {/* Carrusel de imágenes */}
      <ImageCarousel
        images={
          Array.isArray(recipe.images)
            ? recipe.images
            : recipe.images.split(",")
        }
      />

      {/* Sección de ingredientes */}
      <div className="mb-4">
        <h3>Ingredientes</h3>
        <p className="receta-text">{recipe.ingredients}</p>
      </div>

      {/* Sección de procedimiento */}
      <div className="mb-4">
        <h3>Procedimiento</h3>
        <p className="receta-text">{recipe.procedure}</p>
      </div>
    </div>
  );
};

export default RecipeDetails;
