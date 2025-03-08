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
import { Spinner } from "react-bootstrap";

const FavoritesPage = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [favRecipes, setFavRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadMyFavRecipes = async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    try {
      const data = await fetchMyFavRecipes(offset);
      const newRecipes = data.recipes;

      setFavRecipes((prev) => [...prev, ...newRecipes]);
      setOffset((prev) => prev + newRecipes.length);
      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message);
    } finally {
      loadingRef.current = false;
    }
  };

  const [similarRecipes, setSimilarRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [similarOffset, setSimilarOffset] = useState(0);
  const [similarHasMore, setSimilarHasMore] = useState(true);
  const similarLoadingRef = useRef<boolean>(false);

  const loadSimilarRecipes = async () => {
    if (similarLoadingRef.current || !similarHasMore) return;
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
      setSimilarError(err.message);
    } finally {
      similarLoadingRef.current = false;
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
    loadingRef.current = false;
    loadMyFavRecipes();
    loadSimilarRecipes();
  }, [refresh]);

  return (
    <main className="container mb-5 main-container">
      <div className="text-center mb-4">
        <h1 className="display-5 text-primary">{t("yourFavRecipes")}</h1>
      </div>

      <AuthWrapper
        onLoginSuccess={() => {
          setRefresh(!refresh);
        }}
      >
        {loadingRef.current && (
          <div className="spinner-container">
            <Spinner animation="grow" variant="primary" role="status" />
          </div>
        )}
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
    </main>
  );
};

export default FavoritesPage;
