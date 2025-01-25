import React, { useEffect, useState } from "react";
import { CategoryOptions, Ingredient } from "../interfaces";
import { useTranslation } from "react-i18next";
import { fetchIngredients } from "../services/apiService";
import IngredientSearch from "./IngredientSearch";

interface SearchFiltersProps {
  aviableCategories: CategoryOptions[];
  selectedFilters: {
    time: string[];
    difficulty: string[];
    type: string | undefined;
    minSteps: number | undefined;
    maxSteps: number | undefined;
    containsIngredients: string[];
    excludesIngredients: string[];
  };
  onFiltersChange: (filters: {
    time: string[];
    difficulty: string[];
    type: string | undefined;
    minSteps: number | undefined;
    maxSteps: number | undefined;
    containsIngredients: string[];
    excludesIngredients: string[];
  }) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  aviableCategories,
  selectedFilters,
  onFiltersChange,
}) => {
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Estado local para los filtros
  const [localFilters, setLocalFilters] = useState(selectedFilters);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const fetchedIngredients = await fetchIngredients();
        setIngredients(fetchedIngredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    loadIngredients();
  }, []);

  const handleInputChange = (field: "minSteps" | "maxSteps", value: string) => {
    setLocalFilters({
      ...localFilters,
      [field]: value ? parseInt(value, 10) : undefined,
    });
  };

  const handleIngredientSelect = (
    ingredient: Ingredient,
    filterType: "containsIngredients" | "excludesIngredients"
  ) => {
    setLocalFilters({
      ...localFilters,
      [filterType]: localFilters[filterType].includes(ingredient.id)
        ? localFilters[filterType].filter((id) => id !== ingredient.id)
        : [...localFilters[filterType], ingredient.id],
    });
  };

  const handleRemoveIngredient = (
    ingredientId: string,
    filterType: "containsIngredients" | "excludesIngredients"
  ) => {
    setLocalFilters({
      ...localFilters,
      [filterType]: localFilters[filterType].filter(
        (id) => id !== ingredientId
      ),
    });
  };

  // Función que se ejecutará cuando el usuario haga clic en el botón "Aplicar filtros"
  const handleApplyFilters = () => {
    onFiltersChange(localFilters); // Enviar los filtros actuales al componente padre
  };

  return (
    <div className="filters mb-4 p-4 border rounded shadow-sm bg-light">
      {/* Filtros de categorías */}
      {aviableCategories.map((category) => (
        <div key={category.name} className="filter-category mb-4">
          <h5>{t(category.name)}</h5>
          <div className="d-flex flex-wrap">
            {category.options.map((option) => (
              <div className="form-check form-check-inline" key={option}>
                <input
                  type={category.name === "type" ? "radio" : "checkbox"}
                  name={category.name}
                  className="form-check-input"
                  value={option}
                  checked={
                    category.name === "type"
                      ? localFilters.type === option
                      : category.name === "time"
                      ? localFilters.time.includes(option)
                      : localFilters.difficulty.includes(option)
                  }
                  onChange={() =>
                    setLocalFilters({
                      ...localFilters,
                      [category.name]:
                        category.name === "type"
                          ? localFilters.type === option
                            ? undefined // Desmarcar el radio button
                            : option
                          : localFilters[category.name].includes(option)
                          ? localFilters[category.name].filter(
                              (item) => item !== option
                            )
                          : [...localFilters[category.name], option],
                    })
                  }
                />
                <label className="form-check-label">{t(option)}</label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Filtros adicionales */}
      <div className="filter-category mb-4">
        <h5>{t("steps")}</h5>
        <div className="row">
          <div className="col-md-6">
            <label>{t("minSteps")}</label>
            <input
              type="number"
              className="form-control"
              value={localFilters.minSteps || ""}
              onChange={(e) => handleInputChange("minSteps", e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label>{t("maxSteps")}</label>
            <input
              type="number"
              className="form-control"
              value={localFilters.maxSteps || ""}
              onChange={(e) => handleInputChange("maxSteps", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Ingredient Search */}
      <div className="filter-category mb-4">
        <h5>{t("includeIngredients")}</h5>
        <IngredientSearch
          handleIngredientSelect={(ingredient) =>
            handleIngredientSelect(ingredient, "containsIngredients")
          }
          placeholder={t("searchForIngredients")}
          ingredientsToHide={ingredients.filter((ingredient) =>
            localFilters.containsIngredients.includes(ingredient.id)
          )}
        />
        {/* Mostrar ingredientes seleccionados como tags */}
        <div className="mt-2">
          {localFilters.containsIngredients.map((ingredientId) => {
            const ingredient = ingredients.find((i) => i.id === ingredientId);
            return (
              ingredient && (
                <span
                  key={ingredient.id}
                  className="badge bg-primary text-white me-2 mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleRemoveIngredient(ingredient.id, "containsIngredients")
                  }
                >
                  {ingredient.name} <span className="ms-1">×</span>
                </span>
              )
            );
          })}
        </div>
      </div>

      {/* Exclude Ingredient Search */}
      <div className="filter-category mb-4">
        <h5>{t("excludeIngredients")}</h5>
        <IngredientSearch
          handleIngredientSelect={(ingredient) =>
            handleIngredientSelect(ingredient, "excludesIngredients")
          }
          placeholder={t("searchForIngredients")}
          ingredientsToHide={ingredients.filter((ingredient) =>
            localFilters.excludesIngredients.includes(ingredient.id)
          )}
        />
        {/* Mostrar ingredientes excluidos como tags */}
        <div className="mt-2">
          {localFilters.excludesIngredients.map((ingredientId) => {
            const ingredient = ingredients.find((i) => i.id === ingredientId);
            return (
              ingredient && (
                <span
                  key={ingredient.id}
                  className="badge bg-danger text-white me-2 mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleRemoveIngredient(ingredient.id, "excludesIngredients")
                  }
                >
                  {ingredient.name} <span className="ms-1">×</span>
                </span>
              )
            );
          })}
        </div>
      </div>

      {/* Botón para aplicar filtros */}
      <div className="text-center mt-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleApplyFilters} // Ejecutar la función cuando se haga clic
        >
          {t("applyFilters")}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
