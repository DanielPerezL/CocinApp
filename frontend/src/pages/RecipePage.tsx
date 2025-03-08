import { useEffect, useState } from "react";
import RecipeDetails from "../components/RecipeDetails";
import { RecipeDetailDTO, UserPublicDTO } from "../interfaces";
import { useLocation } from "react-router-dom"; // Para obtener parámetros de la URL
import { fetchRecipeDetails, fetchUserPublic } from "../services/apiService";
import { useTranslation } from "react-i18next";
import { useQuery } from "../main";
import NoPage from "./NoPage";
import { Spinner } from "react-bootstrap";

const RecipePage = () => {
  const location = useLocation();
  const query = useQuery();
  const id = query.get("id"); // Obtiene el valor del parámetro 'id'
  const [recipe, setRecipe] = useState<RecipeDetailDTO | null>(null);
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const loadRecipeDetails = async () => {
    setLoading(true);
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }
    try {
      const fetchedRecipe = await fetchRecipeDetails(id); // Llama a la función para obtener las recetas
      setRecipe(fetchedRecipe); // Actualiza el estado con las recetas obtenidas
      const fetchedUser = await fetchUserPublic(fetchedRecipe.user_id);
      setUser(fetchedUser);
    } catch (err: any) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipeDetails(); // Llama a la función al montar el componente o si cambia location(e.d. URL que contiene el ID)
  }, [location]);

  if (error) {
    return <NoPage />;
  }

  return (
    <main className="main-container container">
      {loading && (
        <div className="spinner-container">
          <Spinner animation="grow" variant="primary" role="status" />
        </div>
      )}

      {!loading && !error && recipe && user && (
        <RecipeDetails
          recipe={recipe}
          user={user}
          updateRecipe={() => {
            loadRecipeDetails();
          }}
        />
      )}
    </main>
  );
};

export default RecipePage;
