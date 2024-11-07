import React, { useEffect, useState } from "react";
import AuthWrapper from "../components/AuthWrapper";
import {
  fetchLoggedUserProfile,
  fetchMyRecipes,
  logout,
} from "../services/apiService";
import { RecipeSimpleDTO, UserDTO } from "../interfaces";
import RecipeGrid from "../components/RecipeGrid";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado para gestionar la carga
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const userProfile = await fetchLoggedUserProfile();
        setUser(userProfile);
      } catch (error) {
        window.location.reload();
      }
    };
    const loadMyRecipes = async () => {
      try {
        const fetchedRecipes = await fetchMyRecipes(); // Llama a la función para obtener las recetas
        setRecipes(fetchedRecipes); // Actualiza el estado con las recetas obtenidas
      } catch (err: any) {
        setError(err.message || "Error al cargar las recetas."); // Captura el error y actualiza el estado
      } finally {
        setLoading(false); // Cambia el estado de carga a false al final
      }
    };

    if (!localStorage.getItem("isLoggedIn") === true) return;
    getUserProfile();
    loadMyRecipes();
  }, []);

  return (
    <AuthWrapper>
      <div className="container">
        {user ? (
          <>
            <div className="container main-container">
              <h2 className="text-primary">Perfil de Usuario</h2>
              <div className="p-3">
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Nickname:</strong> {user.nickname}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
              <button
                className="btn btn-danger mt-3"
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
              >
                Cerrar sesión
              </button>
            </div>

            {recipes && (
              <div className="container main-container mt-4">
                <div className="text-center mb-4">
                  {recipes.length > 0 ? (
                    <p className="fs-5 fw-light mb-5">
                      Aquí tienes tus recetas, {user.nickname}
                    </p>
                  ) : (
                    <p className="fs-5 fw-light">
                      Aún no has publicado ninguna receta, {user.nickname}
                    </p>
                  )}
                  {loading && <p>Cargando recetas...</p>}
                  {error && <p className="text-danger">{error}</p>}
                  {!loading && !error && <RecipeGrid recipes={recipes} />}
                </div>
              </div>
            )}
          </>
        ) : (
          <p>Cargando perfil del usuario...</p>
        )}
      </div>
    </AuthWrapper>
  );
};

export default ProfilePage;
