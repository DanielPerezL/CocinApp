import React from "react";
import RecetaGrid from "../components/RecipeGrid";
import { RecipeGridDTO, UserDTO } from "../interfaces";
import RecipeCarousel from "../components/RecipeCarousel";

// Array de recetas de ejemplo
let favRecipes: RecipeGridDTO[] = [
  {
    id: 0,
    title: "Spaghetti Carbonara",
    image: "https://via.placeholder.com/100x100",
  },
  {
    id: 1,
    title: "Ensalada César",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 5,
    title: "Sushi Variado",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 6,
    title: "Hamburguesa Clásica",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 7,
    title: "Tacos Mexicanos",
    image: "https://via.placeholder.com/300x200",
  },
  { id: 8, title: "Ratatouille", image: "https://via.placeholder.com/300x200" },
  {
    id: 9,
    title: "Ratatouille 2 (ahora es personal)",
    image: "https://via.placeholder.com/300x200",
  },
];

let testUser: UserDTO = {
  id: 0,
  name: "Daniel",
};

const FavoritesPage = () => {
  return (
    <>
      <div className="container my-5 main-container">
        <div className="text-center mb-4">
          <h1 className="display-5 text-primary">Tus Recetas Favoritas</h1>
          <p className="fs-6 fw-light">
            Aquí tienes tus recetas favoritas, {testUser.name}!
          </p>
        </div>
        <RecetaGrid recipes={favRecipes} />
      </div>

      <div className="container my-5 main-container">
        <div className="text-center mb-4">
          <h1 className="display-6 text-primary">Explora nuevas recetas</h1>
        </div>
        <RecipeCarousel recipes={favRecipes} />
      </div>
    </>
  );
};

export default FavoritesPage;
