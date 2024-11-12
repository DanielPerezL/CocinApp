import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { UserDTO } from "../interfaces";
import {
  getImage,
  logout,
  removeAccount,
  removeProfilePic,
  updateProfilePic,
  uploadImage,
} from "../services/apiService";
import userDefaultPic from "../assets/user.png";
import { useTranslation } from "react-i18next";
import ImageModal from "./ImagenModal";

interface UserDetailsProps {
  user: UserDTO;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const { t } = useTranslation();

  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userPic, setUserPic] = useState<string>(user.picture);
  const [showModal, setShowModal] = useState(false);

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Vacía el contenido del input
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    // Verifica si se ha seleccionado un archivo
    if (file) {
      const imageUrl = await uploadImage(file); // Usa `file` directamente aquí
      await updateProfilePic(imageUrl); // Actualizar la foto de perfil en el backend
      setUserPic(imageUrl);
      setImgError(false);
      clearFileInput();
    }
  };

  const handlePhotoDelete = async () => {
    await removeProfilePic(); // Actualizar la foto de perfil del usuario en el backend
    setUserPic("");
  };

  const handleDeleteAccount = async () => {
    await removeAccount();
    window.location.reload();
  };

  return (
    <div className="container main-container">
      <h2 className="text-primary">{t("userProfile")}</h2>
      <div className="d-flex flex-column align-items-center p-3">
        <img
          src={!imgError ? getImage(userPic) : userDefaultPic}
          className="rounded-circle"
          style={{ width: "6rem", height: "6rem", objectFit: "cover" }}
          onError={() => {
            setImgError(true);
          }}
          onClick={() => {
            setShowModal(true);
          }}
        />
        <div className="d-flex flex-column flex-sm-row align-items-center mt-3">
          <button
            className="btn btn-secondary ms-2 mt-3"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            {t("modifyPic")}
          </button>
          <button
            className="btn btn-danger ms-2 mt-3"
            onClick={handlePhotoDelete}
          >
            {t("rmPic")}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
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

      <div className="d-flex flex-column flex-sm-row align-items-center mt-3">
        <button
          className="btn btn-danger mt-3 ms-2"
          onClick={() => {
            logout();
            window.location.reload();
          }}
        >
          {t("logout")}
        </button>
        <button
          className="btn btn-danger mt-3 ms-2"
          onClick={handleDeleteAccount}
        >
          {t("rmAccount")}
        </button>
      </div>
      <ImageModal
        show={showModal}
        image={!imgError ? getImage(userPic) : userDefaultPic}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default UserDetails;
