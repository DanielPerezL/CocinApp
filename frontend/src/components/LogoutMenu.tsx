// src/components/LogoutMenu.tsx
import React, { useEffect, useState } from "react";
import {
  logout,
  fetchMyRecipes,
  fetchLoggedUserProfile,
} from "../services/apiService"; // Ajusta la ruta según tu estructura
import RecipeGrid from "./RecipeGrid"; // Asegúrate de que esta ruta sea correcta
import { RecipeSimpleDTO, UserDTO } from "../interfaces"; // Asegúrate de que esta ruta sea correcta

const LogoutMenu: React.FC = () => {
  const [loading, setLoading] = useState(true); // Estado para gestionar la carga
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]); // Estado para almacenar recetas
  const [user, setUser] = useState<UserDTO>(); // Estado para almacenar recetas

  const handleLogout = async () => {
    try {
      await logout(); // Llama a la función de logout para cerrar sesión
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true); // Inicia la carga
      setError(null); // Reinicia el error
      try {
        const fetchedRecipes = await fetchMyRecipes(); // Llama a la función para obtener recetas
        setRecipes(fetchedRecipes); // Actualiza el estado de recetas
      } catch (error) {
        setError("Failed to fetch recipes"); // Maneja el error
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };
    const loadUser = async () => {
      const fetchedUser = await fetchLoggedUserProfile(); // Llama a la función para obtener las recetas
      setUser(fetchedUser); // Actualiza el estado con las recetas obtenidas
    };

    loadUser();
    loadRecipes(); // Carga las recetas al montar el componente
  }, []);

  // Comprobar si el usuario está logueado
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <>
      {isLoggedIn ? ( // Muestra el menú de logout solo si el usuario está logueado
        <>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
          {loading && <p>Cargando recetas...</p>}{" "}
          {/* Muestra un mensaje de carga */}
          {error && <p className="text-danger">{error}</p>}{" "}
          {/* Muestra el error si ocurre */}
          {!loading && !error && <RecipeGrid recipes={recipes} />}{" "}
          {/* Renderiza RecipeGrid si no hay errores y no está cargando */}
          {user && <p>{`Nickname:${user.nickname} Email:${user.email}`}</p>}
        </>
      ) : (
        <p>No estás logueado.</p> // Mensaje si el usuario no está logueado
      )}
    </>
  );
};

export default LogoutMenu;
