import React, { useEffect, useRef, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import SearchFilters from "../components/SearchFilters"; // Importamos el nuevo componente
import { RecipeSimpleDTO, CategoryOptions } from "../interfaces";
import {
  fetchRecipesBySearch,
  fetchRecipesCategories,
} from "../services/apiService";
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

  // Filtros
  const title = query.get("title") || undefined;
  const [aviableCategories, setAviableCategories] = useState<CategoryOptions[]>(
    []
  );

  const [filters, setFilters] = useState({
    time: [] as string[],
    difficulty: [] as string[],
    type: undefined as string | undefined,
    minSteps: undefined as number | undefined,
    maxSteps: undefined as number | undefined,
    containsIngredients: [] as string[],
    excludesIngredients: [] as string[],
  });

  const loadRecipeCategories = async () => {
    try {
      const fetchedCategories = await fetchRecipesCategories();
      setAviableCategories(fetchedCategories);
    } catch (err: any) {
      console.log(err);
    }
  };

  const loadRecipes = async () => {
    if (loadingRef.current || !hasMore) return; // Evitar solicitudes repetidas

    loadingRef.current = true;

    try {
      const data = await fetchRecipesBySearch(
        offset,
        undefined, // limit
        title, // title
        filters.minSteps, // minSteps
        filters.maxSteps, // maxSteps
        filters.time, // time (array de tiempos)
        filters.difficulty, // difficulty (array de dificultades)
        filters.type, // type
        filters.containsIngredients, // containsIngredients
        filters.excludesIngredients // excludesIngredients
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

  useEffect(() => {
    loadRecipeCategories();
  }, []);

  //USE EFECT PARA ACTUALIZAR BUSQUEDA SEGUN LOS CAMPOS
  useEffect(() => {
    setRecipes([]); // Limpiar recetas anteriores
    setOffset(0); // Resetear offset
    setHasMore(true); // Restablecer el estado de 'hasMore'
    loadingRef.current = false;

    setReadyForLoad(true);
  }, [title, filters]);

  // Ejecutar la carga de recetas solo cuando esté listo para hacerlo
  useEffect(() => {
    if (readyForLoad) {
      loadRecipes(); // Cargar recetas
      setReadyForLoad(false); // Desactivar el estado de "listo" después de la carga
    }
  }, [readyForLoad]);

  return (
    <div className="container my-5 main-container">
      <div className="text-center mb-5">
        <h1 className="display-4 text-primary">{t("searchTitle")}</h1>
      </div>
      {/* FILTROS */}
      <SearchFilters
        aviableCategories={aviableCategories}
        selectedFilters={filters}
        onFiltersChange={(updatedFilters) => setFilters(updatedFilters)}
      />

      {/* RECETAS */}
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
