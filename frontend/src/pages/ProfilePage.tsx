import React, { useEffect, useState } from "react";
import AuthWrapper from "../components/AuthWrapper";
import {
  fetchLoggedUserProfile,
  fetchMyRecipes,
  isLoggedIn,
  logout,
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
  const [loading, setLoading] = useState<boolean>(true); // Estado para gestionar la carga
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const userProfile = await fetchLoggedUserProfile();
        setUser(userProfile);
      } catch (error) {
        window.location.reload();
      }
    };
    const loadMyRecipes = async () => {
      try {
        const fetchedRecipes = await fetchMyRecipes(); // Llama a la función para obtener las recetas
        setRecipes(fetchedRecipes); // Actualiza el estado con las recetas obtenidas
      } catch (err: any) {
        setError(err.message); // Captura el error y actualiza el estado
      } finally {
        setLoading(false); // Cambia el estado de carga a false al final
      }
    };

    if (!isLoggedIn()) return;
    getUserProfile();
    loadMyRecipes();
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
                  {loading && <p>{t("loadingRecipes")}</p>}
                  {error && <p className="text-danger">{error}</p>}
                  {!loading && !error && <RecipeGrid recipes={recipes} />}
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
