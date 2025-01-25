import React, { useEffect, useState } from "react";
import { Ingredient, ConcreteIngredient } from "../interfaces";
import { useTranslation } from "react-i18next";
import { fetchIngredients } from "../services/apiService";
import "../css/IngredientSearch.css";

interface IngredientSearchProps {
  handleIngredientSelect: (ingredient: Ingredient) => void;
  placeholder: string;
  ingredientsToHide: Ingredient[];
  id: string;
}

const IngredientSearch: React.FC<IngredientSearchProps> = ({
  handleIngredientSelect,
  placeholder,
  ingredientsToHide,
  id,
}) => {
  const { t } = useTranslation();

  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [ingredientInput, setIngredientInput] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  // Filtrar ingredientes que coinciden con lo que el usuario escribe
  const filteredIngredients = ingredientsList
    .filter((ingredient) =>
      ingredient.name.toLowerCase().includes(ingredientInput.toLowerCase())
    )
    .filter(
      (ingredient) =>
        !ingredientsToHide.some(
          (ingredientToHide) => ingredientToHide.id === ingredient.id
        )
    );

  const handleSelect = (ingredient: Ingredient): void => {
    setIngredientInput("");
    handleIngredientSelect(ingredient);
  };

  useEffect(() => {
    const loadIngredients = async () => {
      setError(false);
      try {
        const fetchedIngredients = await fetchIngredients();
        setIngredientsList(fetchedIngredients);
      } catch (err: any) {
        setError(true);
      }
    };

    loadIngredients();
  }, []);

  if (!error)
    return (
      <>
        <input
          id={id}
          name="ingredients"
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={ingredientInput}
          onChange={(e) => setIngredientInput(e.target.value)}
        />
        <div className="mt-2">
          {ingredientInput && filteredIngredients.length > 0 && (
            <ul className="list-group ingredient-list">
              {filteredIngredients.map((ingredient) => (
                <li
                  key={ingredient.name}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  onClick={() => handleSelect(ingredient)}
                >
                  {ingredient.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </>
    );

  return (
    <div className="ingredient-search">
      <div className="mb-3">
        <input
          id="ingredient"
          name="ingredient"
          type="text"
          className="form-control"
          placeholder={t("errorLoadingRecipesIngredients")}
          value={ingredientInput}
          disabled={true}
        />
      </div>
    </div>
  );
};

export default IngredientSearch;
