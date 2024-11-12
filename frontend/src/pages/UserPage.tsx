import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchUserPublicFromNick,
  fetchUserRecipes,
} from "../services/apiService"; // Ajusta la ruta según tu proyecto
import { UserPublicDTO, RecipeSimpleDTO } from "../interfaces";
import RecipeGrid from "../components/RecipeGrid"; // Ajusta la ruta según tu proyecto
import { t } from "i18next";
import UserPublicDetails from "../components/UserPublicDetails";
import NoPage from "./NoPage";

const UserPage: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>(); // Obtenemos el nickname de la URL
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!nickname) {
        setError(t("errorInvalidUser"));
        return;
      }

      try {
        // Obtener los detalles del usuario por su nickname
        const userData = await fetchUserPublicFromNick(nickname);
        setUser(userData);
        const userRecipes = await fetchUserRecipes(userData.id);
        setRecipes(userRecipes);
      } catch (err) {
        setError(t("errorUserNotFound"));
      }
    };

    loadUserData();
  }, [nickname]);

  if (error) return <NoPage />;

  return (
    <div className="container main-container">
      {user ? (
        <>
          <UserPublicDetails user={user} />

          {recipes && (
            <div className="container mt-4">
              <div className="text-center mb-4">
                {recipes.length > 0 ? (
                  <p className="fs-5 fw-light mb-5">{t("theirRecipes")}</p>
                ) : (
                  <p className="fs-5 fw-light">{t("noTheirRecipes")}</p>
                )}
                {error && <p className="text-danger">{error}</p>}
                {!error && <RecipeGrid recipes={recipes} />}
              </div>
            </div>
          )}
        </>
      ) : (
        <p>{t("loadingUserProfile")}</p>
      )}
    </div>
  );
};

export default UserPage;
