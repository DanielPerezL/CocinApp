import { useEffect, useState } from "react";
import RecetaGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import AuthWrapper from "../components/AuthWrapper";
import {
  fetchLoggedUserProfile,
  fetchMyFavRecipes,
} from "../services/apiService";
import { useTranslation } from "react-i18next";

const FavoritesPage = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [favRecipes, setFavRecipes] = useState<RecipeSimpleDTO[]>([]);
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
    const loadMyFavRecipes = async () => {
      try {
        const fetchedRecipes = await fetchMyFavRecipes(); // Llama a la función para obtener las recetas
        setFavRecipes(fetchedRecipes); // Actualiza el estado con las recetas obtenidas
      } catch (err: any) {
        setError(err.message); // Captura el error y actualiza el estado
      } finally {
        setLoading(false); // Cambia el estado de carga a false al final
      }
    };

    if (!localStorage.getItem("isLoggedIn") === true) return;
    getUserProfile();
    loadMyFavRecipes();
  }, [refresh]);

  return (
    <div className="container mb-5 main-container">
      <div className="text-center mb-4">
        <h1 className="display-5 text-primary">{t("yourFavRecipes")}</h1>
      </div>

      <AuthWrapper
        onLoginSuccess={() => {
          setRefresh(!refresh);
        }}
      >
        {loading && <p>{t("loadingRecipes")}</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && user && (
          <>
            <div className="text-center mb-4">
              {favRecipes.length > 0 ? (
                <p className="fs-6 fw-light">{t("hereFavRecipes")}</p>
              ) : (
                <p className="fs-6 fw-light">{t("noFavRecipes")}</p>
              )}
            </div>
            <RecetaGrid recipes={favRecipes} />
          </>
        )}
      </AuthWrapper>

      {/*TODO: USAR RECIPE CARROUSEL PARA MOSTRAR RECETAS RANDOM (como en Home)*/}
    </div>
  );
};

export default FavoritesPage;
