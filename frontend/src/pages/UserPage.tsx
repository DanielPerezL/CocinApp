import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  RECIPE_LIMIT,
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

  const loadingRef = useRef<boolean>(false); // Estado para gestionar la carga
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadRecipes = async (user_id: string) => {
    if (loadingRef.current || !hasMore) return; // Evitar solicitudes repetidas
    loadingRef.current = true;
    try {
      const newRecipes = await fetchUserRecipes(user_id, offset); // Llama a la función para obtener las recetas
      setRecipes((prev) => [...prev, ...newRecipes]); // Agregar recetas nuevas
      setOffset((prev) => prev + newRecipes.length); // Incrementar el offset
      if (newRecipes.length < RECIPE_LIMIT) setHasMore(false); // Si no hay más recetas, desactivar carga
    } catch (err: any) {
      setError(err.message); // Captura el error y actualiza el estado
    } finally {
      loadingRef.current = false; // Cambia el estado de carga a false al final
    }
  };

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
        loadRecipes(userData.id);
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
              <div className="text-center mb-2">
                {recipes.length > 0 ? (
                  <p className="fs-6 fw-light mt-4 mb-3">{t("theirRecipes")}</p>
                ) : (
                  <p className="fs-6 fw-light mt-4 mb-3">
                    {t("noTheirRecipes")}
                  </p>
                )}
                {error && <p className="text-danger">{error}</p>}
                {!error && (
                  <RecipeGrid
                    hasMore={hasMore}
                    loading={loadingRef.current}
                    onLoadMore={() => {
                      loadRecipes(user.id);
                    }}
                    recipes={recipes}
                  />
                )}
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
