import React, { useEffect, useState } from "react";
import RecetaGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import RecipeCarousel from "../components/RecipeCarousel";
import AuthWrapper from "../components/AuthWrapper";
import { fetchLoggedUserProfile } from "../services/apiService";

// Array de recetas de ejemplo
let favRecipes: RecipeSimpleDTO[] = [
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

const FavoritesPage = () => {
  const [user, setUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    const getUserProfile = async () => {
      if (!localStorage.getItem("isLoggedIn") === true) return;
      const userProfile = await fetchLoggedUserProfile();
      setUser(userProfile);
    };

    getUserProfile();
  }, []);
  return (
    <>
      <AuthWrapper>
        <div className="container mb-5 main-container">
          <div className="text-center mb-4">
            <h1 className="display-5 text-primary">Tus Recetas Favoritas</h1>
            {user && (
              <p className="fs-6 fw-light">
                Aquí tienes tus recetas favoritas, {user.nickname}!
              </p>
            )}
          </div>
          <RecetaGrid recipes={favRecipes} />
        </div>
      </AuthWrapper>

      {/*TODO: USAR RECIPE CARROUSEL PARA MOSTRAR RECETAS RANDOM (como en Home)*/}
    </>
  );
};

export default FavoritesPage;
