import { useEffect, useRef, useState } from "react";
import RecetaGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import AuthWrapper from "../components/AuthWrapper";
import {
  fetchLoggedUserProfile,
  fetchMyFavRecipes,
  fetchRecipesFavBySimilarUsers,
  isLoggedIn,
} from "../services/apiService";
import { useTranslation } from "react-i18next";
import RecipeGrid from "../components/RecipeGrid";

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
      const data = await fetchMyFavRecipes(offset); // Llama a la función para obtener las recetas
      const newRecipes = data.recipes;

      setFavRecipes((prev) => [...prev, ...newRecipes]); // Agregar recetas nuevas
      setOffset((prev) => prev + newRecipes.length); // Incrementar el offset
      setHasMore(data.has_more); // Si no hay más recetas, desactivar carga
    } catch (err: any) {
      setError(err.message); // Captura el error y actualiza el estado
    } finally {
      loadingRef.current = false; // Cambia el estado de carga a false al final
    }
  };

  const [similarRecipes, setSimilarRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [similarError, setSimilarError] = useState<string | null>(null); // Estado para gestionar errores
  const [similarOffset, setSimilarOffset] = useState(0);
  const [similarHasMore, setSimilarHasMore] = useState(true);
  const similarLoadingRef = useRef<boolean>(false); // Estado para gestionar la carga

  const loadSimilarRecipes = async () => {
    if (similarLoadingRef.current || !similarHasMore) return; // Evitar solicitudes repetidas
    similarLoadingRef.current = true;
    try {
      let data;
      if (similarOffset == 0) {
        const limit = 4;
        data = await fetchRecipesFavBySimilarUsers(similarOffset, limit);
      } else {
        data = await fetchRecipesFavBySimilarUsers(similarOffset);
      }

      const newRecipes = data.recipes;

      setSimilarRecipes((prev) => {
        // Evitar duplicados combinando las nuevas recetas con las existentes
        const existingIds = new Set(prev.map((recipe) => recipe.id));
        const uniqueRecipes = newRecipes.filter(
          (recipe) => !existingIds.has(recipe.id)
        );
        const duplicates = newRecipes.length - uniqueRecipes.length;

        // Si existen duplicados, ajustamos el offset
        const newOffset = similarOffset + (newRecipes.length - duplicates);
        setSimilarOffset(newOffset); // Actualizar el offset con el valor correcto

        return [...prev, ...uniqueRecipes];
      });
      setSimilarHasMore(data.has_more); // Si no hay más recetas, desactivar carga
    } catch (err: any) {
      setSimilarError(err.message); // Captura el error y actualiza el estado
    } finally {
      similarLoadingRef.current = false; // Cambia el estado de carga a false al final
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
    loadSimilarRecipes();
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
            <RecipeGrid
              hasMore={hasMore}
              loading={loadingRef.current}
              onLoadMore={() => {
                loadMyFavRecipes();
              }}
              recipes={favRecipes}
            />
            <div className="mt-4">
              {/*USAR CARROUSEL EN VEZ DE GRID?*/}
              {!loadingRef.current &&
                !similarError &&
                similarRecipes.length > 0 && (
                  <>
                    <p className="fs-6 fw-light mt-4 mb-3">
                      {t("similarUsersLikes")}
                    </p>
                    <RecipeGrid
                      hasMore={similarHasMore}
                      loading={similarLoadingRef.current}
                      onLoadMore={loadSimilarRecipes}
                      recipes={similarRecipes}
                    />
                  </>
                )}
            </div>
          </>
        )}
      </AuthWrapper>
    </div>
  );
};

export default FavoritesPage;
