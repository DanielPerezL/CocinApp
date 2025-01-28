import React, { ReactNode, useState } from "react";
import AccessMenu from "../components/AccessMenu";
import { isLoggedIn } from "../services/apiService";

interface AuthWrapperProps {
  children: ReactNode;
  onLoginSuccess: () => void;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  onLoginSuccess,
}) => {
  if (!isLoggedIn()) {
    return <AccessMenu onLoginSuccess={onLoginSuccess} />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
