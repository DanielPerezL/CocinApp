import React, { ReactNode } from "react";
import AccessMenu from "../components/AccessMenu";

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  if (!localStorage.getItem("isLoggedIn")) {
    return <AccessMenu />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
