import React, { useEffect, useState } from "react";
import LoginMenu from "../components/LoginMenu"; // Ajusta la ruta según tu estructura
import { logout, fetchMyRecipes } from "../services/apiService"; // Asegúrate de importar la función de logout
import { RecipeGridDTO } from "../interfaces";
import RecipeGrid from "../components/RecipeGrid";
import LogoutMenu from "../components/LogoutMenu";

const ProfilePage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Verifica si el usuario está logueado al cargar el componente
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true"); // Establece el estado basado en localStorage
  }, []);

  return <div>{!isLoggedIn ? <LoginMenu /> : <LogoutMenu />}</div>;
};

export default ProfilePage;
