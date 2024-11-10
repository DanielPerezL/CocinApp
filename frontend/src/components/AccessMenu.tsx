import React, { useEffect, useState } from "react";
import LoginMenu from "./LoginMenu"; // Importar el componente LoginMenu
import RegisterMenu from "./RegisterMenu"; // Importar el componente RegisterMenu
import { login, registerUser } from "../services/apiService"; // Importar funciones de API
import { t } from "i18next";

const AccessMenu: React.FC = () => {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      //TODO: ACTUALIZAR SOLO COMPONENTE
      window.location.reload();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const handleRegisterSubmit = async (
    nickname: string,
    email: string,
    password: string
  ) => {
    try {
      return await registerUser(nickname, email, password);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return (
    <div className="container">
      <div className="access-menu main-container w-100 w-sm-50">
        <h2 className="text-center">
          {showLogin ? t("login") : t("register")}
        </h2>
        {showLogin ? (
          <LoginMenu onSubmit={handleLoginSubmit} />
        ) : (
          <>
            <RegisterMenu onSubmit={handleRegisterSubmit} />
          </>
        )}
        <button
          className="btn btn-link"
          onClick={() => setShowLogin((prev) => !prev)}
        >
          {showLogin ? t("noAccount?") : t("yesAccount?")}
        </button>
      </div>
    </div>
  );
};

export default AccessMenu;
