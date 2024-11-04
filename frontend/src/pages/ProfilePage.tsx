import React, { useEffect, useState } from "react";
import LoginMenu from "../components/LoginMenu"; // Ajusta la ruta según tu estructura
import { logout, fetchMyRecipes } from "../services/apiService"; // Asegúrate de importar la función de logout
import RecipeGrid from "../components/RecipeGrid";
import LogoutMenu from "../components/LogoutMenu";
import ImageUploader from "../components/ImageUploader";

const ProfilePage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Verifica si el usuario está logueado al cargar el componente
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true"); // Establece el estado basado en localStorage
  }, []);

  return (
    <div>
      {!isLoggedIn ? (
        <LoginMenu />
      ) : (
        <>
          <LogoutMenu /> <ImageUploader />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
