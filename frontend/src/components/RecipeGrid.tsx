import React, { useRef } from "react";
import RecipeCard from "./RecipeCard"; // Asegúrate de importar correctamente tu componente
import { RecipeSimpleDTO } from "../interfaces";
import { useTranslation } from "react-i18next";

interface RecipesGridProps {
  recipes: RecipeSimpleDTO[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

const RecipeGrid: React.FC<RecipesGridProps> = ({
  recipes,
  hasMore,
  loading,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const loadMoreButtonRef = useRef<HTMLButtonElement | null>(null); // Referencia al botón

  return (
    <>
      <div className="row">
        {recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
      </div>
      {hasMore && !loading && (
        <div className="d-flex justify-content-center mt-5">
          <button
            ref={loadMoreButtonRef}
            onClick={onLoadMore}
            className="btn btn-primary col-12 col-md-3"
          >
            {t("loadMore")}
          </button>
        </div>
      )}
    </>
  );
};

export default RecipeGrid;
