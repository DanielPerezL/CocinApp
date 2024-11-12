import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { UserDTO, UserPublicDTO } from "../interfaces";
import {
  getImage,
  logout,
  removeProfilePic,
  updateProfilePic,
  uploadImage,
} from "../services/apiService";
import userDefaultPic from "../assets/user.png";
import { useTranslation } from "react-i18next";

interface UserPublicDetailsProps {
  user: UserPublicDTO;
}

const UserPublicDetails: React.FC<UserPublicDetailsProps> = ({ user }) => {
  const { t } = useTranslation();

  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userPic, setUserPic] = useState<string>(user.picture);

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Vacía el contenido del input
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    // Verifica si se ha seleccionado un archivo
    if (file) {
      console.log("selectedImage:", file);

      try {
        const imageUrl = await uploadImage(file); // Usa `file` directamente aquí
        await updateProfilePic(imageUrl); // Actualizar la foto de perfil en el backend
        setUserPic(imageUrl);
        setImgError(false);
        clearFileInput();
      } catch (error) {
        //NO DEBE DAR PROBLEMAS
        console.error("Error al actualizar la foto:", error);
      }
    }
  };

  const handlePhotoDelete = async () => {
    try {
      await removeProfilePic(); // Actualizar la foto de perfil del usuario en el backend
      setUserPic("");
    } catch (error) {
      //NO DEBE DAR PROBLEMAS
      console.error("Error al eliminar la foto:", error);
    }
  };
  return (
    <div className="container">
      <h2 className="text-primary">{user.nickname}</h2>
      <div className="profile-picture-section p-3">
        <img
          src={!imgError ? getImage(userPic) : userDefaultPic}
          alt="Foto de perfil"
          className="rounded-circle"
          style={{ width: "6rem", height: "6rem", objectFit: "cover" }}
          onError={() => {
            setImgError(true);
          }}
        />
      </div>
    </div>
  );
};

export default UserPublicDetails;
