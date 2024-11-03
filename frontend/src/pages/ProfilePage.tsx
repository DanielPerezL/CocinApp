import React, { useEffect, useState } from "react";
import LoginMenu from "../components/LoginMenu"; // Ajusta la ruta según tu estructura
import { logout, fetchMyRecipes } from "../services/apiService"; // Asegúrate de importar la función de logout
import { RecipeGridDTO } from "../interfaces";
import RecipeGrid from "../components/RecipeGrid";

const ProfilePage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<RecipeGridDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado para gestionar la carga
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores

  const loadRecipes = async () => {
    try {
      const fetchedRecipes = await fetchMyRecipes(); // Llama a la función para obtener las recetas
      setRecipes(fetchedRecipes); // Actualiza el estado con las recetas obtenidas
    } catch (err: any) {
      setError(err.message || "Error al cargar las recetas."); // Captura el error y actualiza el estado
    } finally {
      setLoading(false); // Cambia el estado de carga a false al final
    }
  };

  useEffect(() => {
    // Verifica si el usuario está logueado al cargar el componente
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true"); // Establece el estado basado en localStorage
    loadRecipes();
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // Llama a la función de logout para cerrar sesión
      setIsLoggedIn(false); // Actualiza el estado a no logueado
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <LoginMenu />
      ) : (
        <>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
          {loading && <p>Cargando recetas...</p>}{" "}
          {/* Muestra un mensaje de carga */}
          {error && <p className="text-danger">{error}</p>}{" "}
          {/* Muestra el error si ocurre */}
          {!loading && !error && <RecipeGrid recipes={recipes} />}{" "}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
