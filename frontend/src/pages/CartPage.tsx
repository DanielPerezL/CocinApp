import { useEffect, useRef, useState } from "react";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import AuthWrapper from "../components/AuthWrapper";
import {
  fetchLoggedUserProfile,
  fetchMyCartRecipes,
  isLoggedIn,
  rmRecipeCart,
} from "../services/apiService";
import { useTranslation } from "react-i18next";
import RecipeGrid from "../components/RecipeGrid";
import IngredientList from "../components/IngredientList";
import NeedConfirmButton from "../components/NeedConfirmButton";

const CartPage = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<UserDTO | null>(null);
  const [cartRecipes, setCartRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores
  const [refresh, setRefresh] = useState<boolean>(false);

  const loadingRef = useRef<boolean>(false); // Estado para gestionar la carga

  const loadMyCartRecipes = async () => {
    if (loadingRef.current) return; // Evitar solicitudes repetidas
    loadingRef.current = true;
    try {
      const data = await fetchMyCartRecipes(); // Llama a la función para obtener las recetas
      const newRecipes = data.recipes;

      setCartRecipes((prev) => [...prev, ...newRecipes]); // Agregar recetas nuevas
    } catch (err: any) {
      setError(err.message); // Captura el error y actualiza el estado
    } finally {
      loadingRef.current = false; // Cambia el estado de carga a false al final
    }
  };

  const emptyCart = async () => {
    try {
      const removalPromises = cartRecipes.map((recipe) =>
        rmRecipeCart(recipe.id)
      );
      await Promise.all(removalPromises);
      setCartRecipes([]);
    } catch (error) {
      console.error("Error emptying cart:", error);
    } finally {
      setRefresh(!refresh);
      window.scrollTo(0, 0);
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
    loadMyCartRecipes();
  }, [refresh]);

  return (
    <div className="container mb-5 main-container">
      <div className="text-center mb-4">
        <h1 className="display-5 text-primary">{t("yourCartRecipes")}</h1>
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
              {cartRecipes.length > 0 ? (
                <p className="fs-6 fw-light">{t("hereCartRecipes")}</p>
              ) : (
                <p className="fs-6 fw-light">{t("noCartRecipes")}</p>
              )}
            </div>

            {cartRecipes.length > 0 && (
              <>
                <RecipeGrid
                  hasMore={false}
                  loading={loadingRef.current}
                  onLoadMore={() => {}}
                  recipes={cartRecipes}
                />
                <IngredientList recipes={cartRecipes} />
                <div className="d-flex justify-content-center mt-4">
                  <NeedConfirmButton
                    className="btn btn-primary"
                    onConfirm={emptyCart}
                    title={t("emptyCart")}
                    message={t("emptyCartMessage")}
                  >
                    {t("emptyCart")}
                  </NeedConfirmButton>
                </div>
              </>
            )}
          </>
        )}
      </AuthWrapper>
    </div>
  );
};

export default CartPage;
