import { useEffect, useRef, useState } from "react";
import RecetaGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import AuthWrapper from "../components/AuthWrapper";
import {
  RECIPE_LIMIT,
  fetchLoggedUserProfile,
  fetchMyFavRecipes,
  isLoggedIn,
} from "../services/apiService";
import { useTranslation } from "react-i18next";

const FavoritesPage = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [favRecipes, setFavRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores
  const [refresh, setRefresh] = useState<boolean>(false);

  const loadingRef = useRef<boolean>(false); // Estado para gestionar la carga
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMyFavRecipes = async () => {
    if (loadingRef.current || !hasMore) return; // Evitar solicitudes repetidas
    loadingRef.current = true;
    try {
      const newRecipes = await fetchMyFavRecipes(offset); // Llama a la función para obtener las recetas
      setFavRecipes((prev) => [...prev, ...newRecipes]); // Agregar recetas nuevas
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
      } catch (error) {
        window.location.reload();
      }
    };
    if (!isLoggedIn()) return;
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
        {loadingRef.current && <p>{t("loadingRecipes")}</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loadingRef.current && !error && user && (
          <>
            <div className="text-center mb-4">
              {favRecipes.length > 0 ? (
                <p className="fs-6 fw-light">{t("hereFavRecipes")}</p>
              ) : (
                <p className="fs-6 fw-light">{t("noFavRecipes")}</p>
              )}
            </div>
            <RecetaGrid
              hasMore={hasMore}
              loading={loadingRef.current}
              onLoadMore={() => {
                loadMyFavRecipes();
              }}
              recipes={favRecipes}
            />
          </>
        )}
      </AuthWrapper>

      {/*TODO: USAR RECIPE CARROUSEL PARA MOSTRAR RECETAS RANDOM (como en Home)*/}
    </div>
  );
};

export default FavoritesPage;
