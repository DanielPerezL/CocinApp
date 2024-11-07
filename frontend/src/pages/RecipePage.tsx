// src/pages/RecipePage.tsx
import React, { useEffect, useState } from "react";
import RecipeDetails from "../components/RecipeDetails";
import { RecipeDetailDTO, UserPublicDTO } from "../interfaces";
import { useLocation } from "react-router-dom"; // Para obtener parámetros de la URL
import { fetchRecipeDetails, fetchUserPublic } from "../services/apiService";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const RecipePage = () => {
  const query = useQuery();
  const id = query.get("id"); // Obtiene el valor del parámetro 'id'
  const [recipe, setRecipe] = useState<RecipeDetailDTO | null>(null);
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener los detalles de la receta
  const loadRecipeDetails = async () => {
    if (!id) {
      setError("ID de receta no proporcionado");
      setLoading(false);
      return;
    }
    try {
      const fetchedRecipe = await fetchRecipeDetails(id); // Llama a la función para obtener las recetas
      setRecipe(fetchedRecipe); // Actualiza el estado con las recetas obtenidas
      const fetchedUser = await fetchUserPublic(fetchedRecipe.user_id); // Llama a la función para obtener las recetas
      setUser(fetchedUser); // Actualiza el estado con las recetas obtenidas
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
    loadRecipeDetails(); // Llama a la función al montar el componente o si cambia el ID
  }, [id]);

  return (
    <div className="container my-5">
      {loading && <p>Cargando detalles de la receta...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && recipe && user && (
        <RecipeDetails recipe={recipe} user={user} />
      )}
    </div>
  );
};

export default RecipePage;
