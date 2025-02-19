// src/pages/RecipePage.tsx
import React, { useEffect, useState } from "react";
import RecipeDetails from "../components/RecipeDetails";
import { RecipeDetailDTO, UserPublicDTO } from "../interfaces";
import { useLocation } from "react-router-dom"; // Para obtener parámetros de la URL
import { fetchRecipeDetails, fetchUserPublic } from "../services/apiService";
import { useTranslation } from "react-i18next";
import { useQuery } from "../main";
import NoPage from "./NoPage";

const RecipePage = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const query = useQuery();
  const id = query.get("id"); // Obtiene el valor del parámetro 'id'
  const [recipe, setRecipe] = useState<RecipeDetailDTO | null>(null);
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<boolean>(false);

  const loadRecipeDetails = async () => {
    setLoading(true);
    if (!id) {
      setError(t("errorNoIDRecipe"));
      setLoading(false);
      return;
    }
    try {
      const fetchedRecipe = await fetchRecipeDetails(id); // Llama a la función para obtener las recetas
      setRecipe(fetchedRecipe); // Actualiza el estado con las recetas obtenidas
      const fetchedUser = await fetchUserPublic(fetchedRecipe.user_id);
      setUser(fetchedUser);
    } catch (err: any) {
      setError(err.message);
      setFatalError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipeDetails(); // Llama a la función al montar el componente o si cambia location(e.d. URL que contiene el ID)
  }, [location]);

  if (fatalError) {
    return <NoPage />;
  }

  return (
    <div className="main-container container">
      {loading && <p>{t("loadingRecipeDetails")}</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && !error && recipe && user && (
        <RecipeDetails
          recipe={recipe}
          user={user}
          updateRecipe={() => {
            loadRecipeDetails();
          }}
        />
      )}
    </div>
  );
};

export default RecipePage;
