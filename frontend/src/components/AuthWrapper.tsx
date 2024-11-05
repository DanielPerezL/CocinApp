import React, { useEffect, useState, ReactNode } from "react";
import AccessMenu from "../components/AccessMenu";

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");
  }, []);

  if (!isLoggedIn) {
    return <AccessMenu />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
