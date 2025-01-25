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

  //PARA RESPONDER A ACTUALIZACION DE LOS FILTROS EN EL PADRE
  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

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

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  return (
    <div className="filters mb-4 p-4 border rounded shadow-sm bg-light">
      <h4 className="mb-4">{t("filterRecipes")}</h4>
      <div className="accordion" id="filtersAccordion">
        {/* Filtros por categorías */}
        {aviableCategories.map((category, index) => (
          <div className="accordion-item" key={category.name}>
            <h2 className="accordion-header" id={`heading-${index}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${index}`}
                aria-expanded="false"
                aria-controls={`collapse-${index}`}
              >
                {t(category.name)}
              </button>
            </h2>
            <div
              id={`collapse-${index}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${index}`}
            >
              <div className="accordion-body">
                <div className="d-flex flex-wrap">
                  {category.options.map((option) => (
                    <div className="form-check form-check-inline" key={option}>
                      <input
                        type={category.name === "type" ? "radio" : "checkbox"}
                        name={category.name}
                        id={`${category.name}-${option}`}
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
                                  ? undefined
                                  : option
                                : localFilters[category.name].includes(option)
                                ? localFilters[category.name].filter(
                                    (item) => item !== option
                                  )
                                : [...localFilters[category.name], option],
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`${category.name}-${option}`}
                      >
                        {t(option)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Filtros adicionales */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="heading-steps">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-steps"
              aria-expanded="false"
              aria-controls="collapse-steps"
            >
              {t("steps")}
            </button>
          </h2>
          <div
            id="collapse-steps"
            className="accordion-collapse collapse"
            aria-labelledby="heading-steps"
          >
            <div className="accordion-body">
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="minSteps">{t("minSteps")}</label>
                  <input
                    type="number"
                    id="minSteps"
                    className="form-control"
                    value={localFilters.minSteps || ""}
                    onChange={(e) =>
                      handleInputChange("minSteps", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="maxSteps">{t("maxSteps")}</label>
                  <input
                    type="number"
                    id="maxSteps"
                    className="form-control"
                    value={localFilters.maxSteps || ""}
                    onChange={(e) =>
                      handleInputChange("maxSteps", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros por ingredientes */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="heading-ingredients">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-ingredients"
              aria-expanded="false"
              aria-controls="collapse-ingredients"
            >
              {t("ingredients")}
            </button>
          </h2>
          <div
            id="collapse-ingredients"
            className="accordion-collapse collapse"
            aria-labelledby="heading-ingredients"
          >
            <div className="accordion-body">
              <h6>{t("includeIngredients")}</h6>
              <IngredientSearch
                id="includeIngredients"
                handleIngredientSelect={(ingredient) =>
                  handleIngredientSelect(ingredient, "containsIngredients")
                }
                placeholder={t("enterIngredientsPlaceHolder")}
                ingredientsToHide={ingredients.filter((ingredient) =>
                  localFilters.containsIngredients.includes(ingredient.id)
                )}
              />
              <div className="mt-2">
                {localFilters.containsIngredients.map((ingredientId) => {
                  const ingredient = ingredients.find(
                    (i) => i.id === ingredientId
                  );
                  return (
                    ingredient && (
                      <span
                        key={ingredient.id}
                        className="badge bg-primary text-white me-2 mb-2 cursor-pointer"
                        onClick={() =>
                          handleRemoveIngredient(
                            ingredient.id,
                            "containsIngredients"
                          )
                        }
                      >
                        {ingredient.name} <span className="ms-1">×</span>
                      </span>
                    )
                  );
                })}
              </div>

              <h6 className="mt-3">{t("excludeIngredients")}</h6>
              <IngredientSearch
                id="excludeIngredients"
                handleIngredientSelect={(ingredient) =>
                  handleIngredientSelect(ingredient, "excludesIngredients")
                }
                placeholder={t("enterIngredientsPlaceHolder")}
                ingredientsToHide={ingredients.filter((ingredient) =>
                  localFilters.excludesIngredients.includes(ingredient.id)
                )}
              />
              <div className="mt-2">
                {localFilters.excludesIngredients.map((ingredientId) => {
                  const ingredient = ingredients.find(
                    (i) => i.id === ingredientId
                  );
                  return (
                    ingredient && (
                      <span
                        key={ingredient.id}
                        className="cursor-pointer badge bg-danger text-white me-2 mb-2"
                        onClick={() =>
                          handleRemoveIngredient(
                            ingredient.id,
                            "excludesIngredients"
                          )
                        }
                      >
                        {ingredient.name} <span className="ms-1">×</span>
                      </span>
                    )
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para aplicar filtros */}
      <div className="text-center mt-4">
        <button className="btn btn-primary btn-lg" onClick={handleApplyFilters}>
          {t("applyFilters")}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
