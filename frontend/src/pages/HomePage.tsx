import React, { useEffect, useRef, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO } from "../interfaces";
import { fetchRecipes } from "../services/apiService";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";

const Home = () => {
  const { t } = useTranslation();

  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<boolean>(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadRecipes = async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    try {
      const data = await fetchRecipes(offset);
      const newRecipes = data.recipes;
      setRecipes((prev) => {
        // Evitar duplicados combinando las nuevas recetas con las existentes
        // porque se envian en orden segun su popularidad (popularidad variable)
        const existingIds = new Set(prev.map((recipe) => recipe.id));
        const uniqueRecipes = newRecipes.filter(
          (recipe) => !existingIds.has(recipe.id)
        );
        const duplicates = newRecipes.length - uniqueRecipes.length;

        // Si existen duplicados, ajustamos el offset
        const newOffset = offset + (newRecipes.length - duplicates);
        setOffset(newOffset); // Actualizar el offset con el valor correcto

        return [...prev, ...uniqueRecipes];
      });
      setHasMore(data.has_more); // Si no hay más recetas, desactivar carga
    } catch (err: any) {
      setError(err.message);
    } finally {
      loadingRef.current = false;
    }
  };
  useEffect(() => {
    loadingRef.current = false;
    loadRecipes(); // Llama a la función para cargar las recetas
  }, []); // Se ejecuta solo al montar el componente

  return (
    <main className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">{t("welcome")}</h1>
        <p className="fs-5 fw-light">{t("subwelcome")}</p>
      </div>
      {loadingRef.current && (
        <div className="spinner-container">
          <Spinner animation="grow" variant="primary" role="status" />
        </div>
      )}
      {error && <p className="text-danger">{error}</p>}
      {!loadingRef.current && !error && (
        <RecipeGrid
          hasMore={hasMore}
          loading={loadingRef.current}
          onLoadMore={loadRecipes}
          recipes={recipes}
        />
      )}
    </main>
  );
};

export default Home;
