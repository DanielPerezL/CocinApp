import React, { useEffect, useRef, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO } from "../interfaces";
import { fetchRecipesBySearch } from "../services/apiService";
import { useTranslation } from "react-i18next";
import { useQuery } from "../main";

const SearchPage = () => {
  const { t } = useTranslation();
  const query = useQuery();

  // Estado para almacenar las recetas
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<boolean>(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [readyForLoad, setReadyForLoad] = useState<boolean>(false);

  const title = query.get("title") || undefined;

  const loadRecipes = async () => {
    if (loadingRef.current || !hasMore) return; // Evitar solicitudes repetidas

    loadingRef.current = true;

    try {
      const data = await fetchRecipesBySearch(
        offset,
        undefined, // limit
        title, // title
        undefined, // minSteps
        undefined, // maxSteps
        undefined, // time
        undefined, // difficulty
        undefined, // type
        undefined, // containsIngredients
        undefined // excludesIngredients
      );

      const newRecipes = data.recipes;
      setRecipes((prev) => {
        const existingIds = new Set(prev.map((recipe) => recipe.id));
        const uniqueRecipes = newRecipes.filter(
          (recipe) => !existingIds.has(recipe.id)
        );
        const duplicates = newRecipes.length - uniqueRecipes.length;

        const newOffset = offset + (newRecipes.length - duplicates);
        setOffset(newOffset);

        return [...prev, ...uniqueRecipes];
      });

      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message);
    } finally {
      loadingRef.current = false;
    }
  };

  //USE EFECT PARA ACTUALIZAR BUSQUEDA SEGUN LOS CAMPOS
  useEffect(() => {
    setRecipes([]); // Limpiar recetas anteriores
    setOffset(0); // Resetear offset
    setHasMore(true); // Restablecer el estado de 'hasMore'
    loadingRef.current = false;

    setReadyForLoad(true);
  }, [title]);

  // Ejecutar la carga de recetas solo cuando esté listo para hacerlo
  useEffect(() => {
    if (readyForLoad) {
      loadRecipes(); // Cargar recetas
      setReadyForLoad(false); // Desactivar el estado de "listo" después de la carga
    }
  }, [readyForLoad]); // Este efecto se ejecuta solo cuando se marca como "listo" para cargar

  return (
    <div className="container my-5">
      {/* FILTROS */}
      {loadingRef.current && <p>{t("loadingRecipes")}</p>}
      {error && <p className="text-danger">{error}</p>}
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

export default SearchPage;
