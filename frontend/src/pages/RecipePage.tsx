// src/pages/RecipePage.tsx
import React, { useEffect, useState } from "react";
import RecipeDetails from "../components/RecipeDetails";
import { RecipeDetailsDTO } from "../interfaces";
import { useLocation } from "react-router-dom"; // Para obtener parámetros de la URL

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const RecipePage = () => {
  const query = useQuery();
  const id = query.get("id"); // Obtiene el valor del parámetro 'id'
  const [recipe, setRecipe] = useState<RecipeDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los detalles de la receta
  const fetchRecipeDetails = async () => {
    if (!id) {
      setError("ID de receta no proporcionado");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://${window.location.hostname}:5000/api/recipe_details_dto?id=${id}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los detalles de la receta");
      }
      const data: RecipeDetailsDTO = await response.json();
      setRecipe(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ha ocurrido un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeDetails(); // Llama a la función al montar el componente o si cambia el ID
  }, [id]);

  return (
    <div className="container my-5">
      {loading && <p>Cargando detalles de la receta...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && recipe && <RecipeDetails recipe={recipe} />}
    </div>
  );
};

export default RecipePage;
