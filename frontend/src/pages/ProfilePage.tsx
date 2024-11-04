import React, { useEffect, useState } from "react";
import { logout, fetchMyRecipes } from "../services/apiService";
import RecipeGrid from "../components/RecipeGrid";
import LogoutMenu from "../components/LogoutMenu";
import ImageUploader from "../components/ImageUploader";
import AccessMenu from "../components/AccessMenu";

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
        <AccessMenu />
      ) : (
        <>
          <LogoutMenu /> <ImageUploader />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
