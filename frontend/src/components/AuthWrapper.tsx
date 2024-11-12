import React, { ReactNode, useState } from "react";
import AccessMenu from "../components/AccessMenu";

interface AuthWrapperProps {
  children: ReactNode;
  onLoginSuccess: () => void; // Definir el callback como prop
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  onLoginSuccess,
}) => {
  if (!localStorage.getItem("isLoggedIn")) {
    return <AccessMenu onLoginSuccess={onLoginSuccess} />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
