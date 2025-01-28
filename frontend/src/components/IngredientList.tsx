import React, { useState } from "react";
import { RecipeSimpleDTO, ConcreteIngredient } from "../interfaces";
import { useTranslation } from "react-i18next";

interface IngredientListProps {
  recipes: RecipeSimpleDTO[];
}

const IngredientList: React.FC<IngredientListProps> = ({ recipes }) => {
  const { t } = useTranslation();

  // Estado para manejar qué ingredientes están marcados como "completados"
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set()
  );

  // Función para sumar la cantidad de ingredientes repetidos
  const aggregateIngredients = (
    recipes: RecipeSimpleDTO[]
  ): ConcreteIngredient[] => {
    const ingredientMap: { [key: string]: ConcreteIngredient } = {};

    // Recorremos todas las recetas
    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        if (ingredientMap[ingredient.name]) {
          ingredientMap[ingredient.name].amount = (
            parseFloat(ingredientMap[ingredient.name].amount) +
            parseFloat(ingredient.amount)
          ).toString();
        } else {
          ingredientMap[ingredient.name] = { ...ingredient };
        }
      });
    });
    return Object.values(ingredientMap);
  };

  const aggregatedIngredients = aggregateIngredients(recipes);

  const handleCheck = (ingredientName: string) => {
    setCheckedIngredients((prev) => {
      const newChecked = new Set(prev);
      if (newChecked.has(ingredientName)) {
        newChecked.delete(ingredientName); // Desmarcar si ya está marcado
      } else {
        newChecked.add(ingredientName); // Marcar si no está marcado
      }
      return newChecked;
    });
  };

  return (
    <div className="container mt-5 mb-3">
      <h3 className="fw-light text-primary text-center mb-3">
        {t("yourShoppingList")}
      </h3>
      <ul className="list-group">
        {aggregatedIngredients.map((ingredient, index) => {
          const isChecked = checkedIngredients.has(ingredient.name);
          return (
            <li
              key={index}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                isChecked
                  ? "text-decoration-line-through bg-light"
                  : "cursor-pointer"
              }`}
              onClick={() => handleCheck(ingredient.name)}
            >
              <div className="d-flex align-items-center">
                <span>
                  <strong>{ingredient.name}</strong> (
                  {t(ingredient.default_unit)}
                  ):
                </span>
              </div>
              <span className="badge bg-primary rounded-pill">
                {ingredient.amount}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default IngredientList;
