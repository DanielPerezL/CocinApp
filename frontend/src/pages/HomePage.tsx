// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import RecipeGrid from "../components/RecipeGrid";
import { RecipeGridDTO } from "../interfaces";

const Home = () => {
  // Estado para almacenar las recetas
  const [recetas, setRecetas] = useState<RecipeGridDTO[]>([]);
  const [loading, setLoading] = useState(true); // Estado para gestionar la carga
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores

  // Función para obtener recetas de la API
  const fetchRecipes = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:5000/api/recipes_simple_dto`
      );
      if (!response.ok) {
        throw new Error("Error al obtener las recetas");
      }
      const data: RecipeGridDTO[] = await response.json();
      setRecetas(data); // Actualiza el estado con las recetas obtenidas
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Now TypeScript knows that err is of type Error
      } else {
        setError("An unknown error occurred"); // Fallback for non-Error exceptions
      }
    } finally {
      setLoading(false); // Cambia el estado de carga
    }
  };

  useEffect(() => {
    fetchRecipes(); // Llama a la función para obtener recetas cuando el componente se monte
  }, []);

  return (
    <>
      <div className="container my-5">
        <div className="text-center mb-4">
          <h1 className="display-4 text-primary">Bienvenido a CocinApp</h1>
          <p className="fs-5 fw-light">
            Descubre y comparte tus recetas favoritas
          </p>
        </div>
        {loading && <p>Cargando recetas...</p>}{" "}
        {/* Muestra un mensaje de carga */}
        {error && <p className="text-danger">{error}</p>}{" "}
        {/* Muestra el error si ocurre */}
        {!loading && !error && <RecipeGrid recipes={recetas} />}{" "}
        {/* Renderiza RecipeGrid si no hay errores y no está cargando */}
      </div>
    </>
  );
};

export default Home;
