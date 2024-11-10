import React, { ChangeEvent, useEffect, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { UserDTO } from "../interfaces";
import {
  getImage,
  logout,
  removeProfilePic,
  updateProfilePic,
  uploadImage,
} from "../services/apiService";
import userDefaultPic from "../assets/user.png";
import { useTranslation } from "react-i18next";

interface UserDetailsProps {
  user: UserDTO;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const { t } = useTranslation();

  const [imgError, setImgError] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false); // Estado para controlar si el usuario está editando la foto
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [userPic, setUserPic] = useState<string>(user.picture);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedImage(file || null);
  };

  const handlePhotoUpload = async () => {
    if (selectedImage) {
      try {
        const imageUrl = await uploadImage(selectedImage); // Subir la imagen
        await updateProfilePic(imageUrl); // Actualizar la foto de perfil del usuario en el backend
        setEditingPhoto(false);
        setUserPic(imageUrl);
        setImgError(false);
      } catch (error) {
        console.error("Error al actualizar la foto:", error);
        // Manejar error (opcional: mostrar mensaje al usuario)
      }
    }
  };
  const handlePhotoDelete = async () => {
    try {
      await removeProfilePic(); // Actualizar la foto de perfil del usuario en el backend
      setEditingPhoto(false);
      setUserPic("");
    } catch (error) {
      console.error("Error al eliminar la foto:", error);
      // Manejar error (opcional: mostrar mensaje al usuario)
    }
  };
  return (
    <div className="container main-container">
      <h2 className="text-primary">{t("userProfile")}</h2>
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
        <div className="mt-3">
          {!editingPhoto ? (
            <button
              className="btn btn-secondary mt-3"
              onClick={() => setEditingPhoto(true)}
            >
              {t("modifyPic")}
            </button>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control"
              />
              <button
                className="btn btn-primary mt-2"
                onClick={handlePhotoUpload}
                disabled={!selectedImage}
              >
                {t("savePic")}
              </button>

              <button
                className="btn btn-danger ms-2 mt-2"
                onClick={handlePhotoDelete}
              >
                {t("rmPic")}
              </button>

              <button
                className="btn btn-secondary mt-2 ms-2"
                onClick={() => {
                  setEditingPhoto(false);
                  setSelectedImage(null);
                }}
              >
                {t("cancel")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-3">
        <p>
          <strong>{t("nickname")}:</strong> {user.nickname}
        </p>
        <p>
          <strong>{t("email")}:</strong> {user.email}
        </p>
      </div>

      <button
        className="btn btn-danger mt-3"
        onClick={() => {
          logout();
          window.location.reload();
        }}
      >
        {t("logout")}
      </button>
    </div>
  );
};

export default UserDetails;
