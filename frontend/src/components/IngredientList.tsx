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
          // Si el ingrediente ya existe, sumamos la cantidad
          ingredientMap[ingredient.name].amount = (
            parseFloat(ingredientMap[ingredient.name].amount) +
            parseFloat(ingredient.amount)
          ).toString();
        } else {
          // Si el ingrediente no existe, lo añadimos al map
          ingredientMap[ingredient.name] = { ...ingredient };
        }
      });
    });

    // Convertimos el map a un array y lo retornamos
    return Object.values(ingredientMap);
  };

  // Obtenemos la lista de ingredientes agregados
  const aggregatedIngredients = aggregateIngredients(recipes);

  // Función para manejar el cambio en el estado del ingrediente (marcar/desmarcar)
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
              onClick={() => handleCheck(ingredient.name)} // Maneja el cambio al hacer click en el li
            >
              <div className="d-flex align-items-center">
                <span>
                  <strong>{ingredient.name}</strong> ({ingredient.default_unit}
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
