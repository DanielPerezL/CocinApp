import React, { useEffect, useRef, useState } from "react";
import AuthWrapper from "../components/AuthWrapper";
import {
  RECIPE_LIMIT,
  fetchLoggedUserProfile,
  fetchUserRecipes,
  isLoggedIn,
} from "../services/apiService";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import RecipeGrid from "../components/RecipeGrid";
import UserDetails from "../components/UserDetails";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores
  const [refresh, setRefresh] = useState<boolean>(false);

  const loadingRef = useRef<boolean>(false); // Estado para gestionar la carga
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMyRecipes = async (user_id: string) => {
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
    const getUserProfile = async () => {
      try {
        const userProfile = await fetchLoggedUserProfile();
        setUser(userProfile);
        loadMyRecipes(userProfile.id);
      } catch (error) {
        window.location.reload();
      }
    };

    if (!isLoggedIn()) return;
    getUserProfile();
  }, [refresh]);

  return (
    <AuthWrapper
      onLoginSuccess={() => {
        setRefresh(!refresh);
      }}
    >
      <div className="container">
        {user ? (
          <>
            <UserDetails user={user} />

            {recipes && (
              <div className="container main-container mt-4">
                <div className="text-center mb-4">
                  {recipes.length > 0 ? (
                    <p className="fs-5 fw-light mb-5">{t("hereYourRecipes")}</p>
                  ) : (
                    <>
                      <p className="fs-5 fw-light">{t("noYourRecipes")}</p>
                      <Link
                        to="/publish"
                        onClick={() => {
                          window.scroll(0, 0);
                        }}
                      >
                        <button className="btn btn-secondary">
                          {t("startPublishing")}
                        </button>
                      </Link>
                    </>
                  )}
                  {loadingRef.current && <p>{t("loadingRecipes")}</p>}
                  {error && <p className="text-danger">{error}</p>}
                  {!loadingRef.current && !error && (
                    <RecipeGrid
                      hasMore={hasMore}
                      loading={loadingRef.current}
                      onLoadMore={() => {
                        loadMyRecipes(user.id);
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
    </AuthWrapper>
  );
};

export default ProfilePage;
