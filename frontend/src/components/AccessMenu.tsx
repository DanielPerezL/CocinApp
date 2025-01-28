import React, { useState } from "react";
import LoginMenu from "./LoginMenu";
import RegisterMenu from "./RegisterMenu";
import { login, registerUser } from "../services/apiService";
import { useTranslation } from "react-i18next";

interface AccessMenuProps {
  onLoginSuccess: () => void;
}

const AccessMenu: React.FC<AccessMenuProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();

  const [showLogin, setShowLogin] = useState<boolean>(true);

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      onLoginSuccess();
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
            <RegisterMenu
              onSubmit={handleRegisterSubmit}
              onLogin={handleLoginSubmit}
            />
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
