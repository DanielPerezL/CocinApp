import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import { UserDTO } from "../interfaces";
import {
  getImage,
  getLoggedUserId,
  logout,
  removeAccount,
  removeProfilePic,
  updatePassword,
  updateProfilePic,
  uploadImage,
} from "../services/apiService";
import userDefaultPic from "../assets/user.png";
import { useTranslation } from "react-i18next";
import ImageModal from "./ImagenModal";
import NeedConfirmButton from "./NeedConfirmButton";
import { Button, Modal, Form } from "react-bootstrap";
import ImageCropModal from "./ProfileCropModal";

interface UserDetailsProps {
  user: UserDTO;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const { t } = useTranslation();

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userPic, setUserPic] = useState<string>(user.picture);
  const [showModal, setShowModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  const handleCancelChangePassword = () => {
    setShowChangePasswordModal(false); // Cerrar el modal sin hacer nada
    setCurrentPassword(""); // Limpiar campos
    setNewPassword(""); // Limpiar campos
  };

  const handleConfirmChangePassword = async (event: React.FormEvent) => {
    event.preventDefault(); // Evitar que el formulario recargue la página
    try {
      await updatePassword(currentPassword, newPassword);
      // Mostrar mensaje de éxito
      setMessage(t("passwordUpdatedSuccessfully"));
      setMessageType("success");

      // Limpiar los campos de contraseña
      setCurrentPassword("");
      setNewPassword("");

      // Mostrar el mensaje durante 2 segundos antes de cerrar el modal
      setTimeout(() => {
        setMessage(null);
        setMessageType(null);
        setShowChangePasswordModal(false);
      }, 2000);
    } catch (error: any) {
      // Mostrar mensaje de error sin cerrar el modal
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async (croppedImage: File) => {
    const imageUrl = await uploadImage(croppedImage); // Sube la imagen recortada
    await updateProfilePic(imageUrl); // Actualiza la imagen de perfil
    setUserPic(imageUrl);
    setImgError(false); //Para volver a buscar la img al servidor
    setImageToCrop(null);

    //Eliminar la imagen del input por si se selecciona despues la misma
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePhotoDelete = async () => {
    await removeProfilePic(); // Actualizar la foto de perfil del usuario en el backend
    setUserPic("");
  };

  const handleDeleteAccount = async () => {
    await removeAccount(user.id);
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
            className="btn btn-primary ms-2 mt-3"
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
          {imageToCrop && (
            <ImageCropModal
              image={imageToCrop}
              onClose={() => setImageToCrop(null)}
              onSave={handleCropSave}
            />
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

      <h3 className="text-danger mt-3">{t("dangerZone")}</h3>
      <div className="d-flex flex-column flex-sm-row align-items-center">
        <button
          className="btn btn-danger mt-3 ms-2"
          onClick={() => setShowChangePasswordModal(true)}
        >
          {t("changePassword")}
        </button>
        <NeedConfirmButton
          className="btn btn-danger mt-3 ms-2"
          buttonText={t("logout")}
          title={t("confirmLogoutTitle")}
          message={t("confirmLogoutMessage")}
          onConfirm={() => {
            logout();
            window.location.reload();
          }}
        />
        <NeedConfirmButton
          className="btn btn-danger mt-3 ms-2"
          buttonText={t("rmAccount")}
          title={t("confirmDeleteAccountTitle")}
          message={t("confirmDeleteAccountMessage")}
          onConfirm={handleDeleteAccount}
        />
      </div>
      <ImageModal
        show={showModal}
        image={!imgError ? getImage(userPic) : userDefaultPic}
        onClose={() => setShowModal(false)}
      />

      <Modal
        show={showChangePasswordModal}
        onHide={handleCancelChangePassword}
        centered
      >
        <Form onSubmit={handleConfirmChangePassword}>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>{t("changePassword")}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-light">
            {message && (
              <div
                className={`alert ${
                  messageType === "success" ? "alert-success" : "alert-danger"
                }`}
                role="alert"
              >
                {message}
              </div>
            )}
            <Form.Group controlId="currentPassword">
              <Form.Label>{t("currentPassword")}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t("enterCurrentPassword")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>{t("newPassword")}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t("enterNewPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={handleCancelChangePassword}>
              {t("cancel")}
            </Button>
            <Button variant="danger" type="submit">
              {t("confirm")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetails;
