import React, { useEffect, useRef, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO } from "../interfaces";
import { fetchRecipes } from "../services/apiService";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  // Estado para almacenar las recetas
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores

  const loadingRef = useRef<boolean>(false); // Estado para gestionar la carga
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadRecipes = async () => {
    if (loadingRef.current || !hasMore) return; // Evitar solicitudes repetidas
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
      setError(err.message); // Captura el error y actualiza el estado
    } finally {
      loadingRef.current = false; // Cambia el estado de carga a false al final
    }
  };
  useEffect(() => {
    loadRecipes(); // Llama a la función para cargar las recetas
  }, []); // Se ejecuta solo al montar el componente

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">{t("welcome")}</h1>
        <p className="fs-5 fw-light">{t("subwelcome")}</p>
      </div>
      {loadingRef.current && <p>{t("loadingRecipes")}</p>}{" "}
      {error && <p className="text-danger">{error}</p>}{" "}
      {!loadingRef.current && !error && (
        <RecipeGrid
          hasMore={hasMore}
          loading={loadingRef.current}
          onLoadMore={loadRecipes}
          recipes={recipes}
        />
      )}
    </div>
  );
};

export default Home;
