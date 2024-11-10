import React, { useEffect, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import { RecipeSimpleDTO } from "../interfaces";
import { fetchRecipes } from "../services/apiService";
import { t } from "i18next";

const Home = () => {
  // Estado para almacenar las recetas
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado para gestionar la carga
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const fetchedRecipes = await fetchRecipes(); // Llama a la función para obtener las recetas
        setRecipes(fetchedRecipes); // Actualiza el estado con las recetas obtenidas
      } catch (err: any) {
        setError(t("errorLoadingRecipes")); // Captura el error y actualiza el estado
      } finally {
        setLoading(false); // Cambia el estado de carga a false al final
      }
    };

    loadRecipes(); // Llama a la función para cargar las recetas
  }, []); // Se ejecuta solo al montar el componente

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">{t("welcome")}</h1>
        <p className="fs-5 fw-light">{t("subwelcome")}</p>
      </div>
      {loading && <p>{t("loadingRecipes")}</p>}{" "}
      {error && <p className="text-danger">{error}</p>}{" "}
      {!loading && !error && <RecipeGrid recipes={recipes} />}{" "}
    </div>
  );
};

export default Home;
