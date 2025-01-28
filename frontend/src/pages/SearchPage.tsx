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
import { clearSearchEvents } from "../events/clearSearchEvents";

const SearchPage = () => {
  const { t } = useTranslation();
  const query = useQuery();

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

  const initialFilters = {
    time: [] as string[],
    difficulty: [] as string[],
    type: undefined as string | undefined,
    minSteps: undefined as number | undefined,
    maxSteps: undefined as number | undefined,
    containsIngredients: [] as string[],
    excludesIngredients: [] as string[],
  };

  const [filters, setFilters] = useState(initialFilters);

  const loadRecipeCategories = async () => {
    try {
      const fetchedCategories = await fetchRecipesCategories();
      setAviableCategories(fetchedCategories);
    } catch (err: any) {
      console.log(err);
    }
  };

  const loadRecipes = async () => {
    if (loadingRef.current || !hasMore) return;

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

  const onResetFilters = () => {
    setFilters(initialFilters); // Restaura los filtros iniciales
    clearSearchEvents.emit("clearSearch"); //Para eliminar el texto de la barra de búsqueda superior (filtro titulo)
    loadRecipes(); // Vuelve a cargar las recetas
  };

  useEffect(() => {
    loadRecipeCategories();
  }, []);

  //USE EFECT PARA ACTUALIZAR BUSQUEDA SEGUN LOS CAMPOS
  useEffect(() => {
    setRecipes([]);
    setOffset(0);
    setHasMore(true);
    loadingRef.current = false;

    setReadyForLoad(true);
  }, [title, filters]);

  // Ejecutar la carga de recetas solo cuando esté listo para hacerlo
  useEffect(() => {
    if (readyForLoad) {
      loadRecipes();
      setReadyForLoad(false);
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
      {!loadingRef.current && !error && recipes.length > 0 && (
        <RecipeGrid
          hasMore={hasMore}
          loading={loadingRef.current}
          onLoadMore={loadRecipes}
          recipes={recipes}
        />
      )}
      {!loadingRef.current && !error && recipes.length === 0 && (
        <div className="text-center mt-5">
          <div className="alert alert-warning p-4 shadow-sm" role="alert">
            <i className="bi bi-emoji-frown fs-1 text-warning"></i>
            <h4 className="mt-3">{t("noSearchResults")}</h4>
            <p className="text-muted">{t("noSearchResultsMessage")}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => onResetFilters()}
            >
              {t("resetFilters")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
