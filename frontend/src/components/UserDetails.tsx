import React, { useEffect, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { UserDTO } from "../interfaces";
import { logout } from "../services/apiService";

interface UserDetailsProps {
  user: UserDTO;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  return (
    <div className="container main-container">
      <h2 className="text-primary">Perfil de Usuario</h2>
      <div className="p-3">
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
  );
};

export default UserDetails;
