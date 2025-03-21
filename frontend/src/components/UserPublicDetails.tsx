import React, { useState } from "react";
import { UserPublicDTO } from "../interfaces";
import {
  getLoggedUserId,
  isAdmin,
  removeAccount,
} from "../services/apiService";
import userDefaultPic from "../assets/user.png";
import { useTranslation } from "react-i18next";
import ImageModal from "./ImagenModal";
import NeedConfirmButton from "./NeedConfirmButton";
import ReportButton from "./ReportButton";
import "../css/UserPublicDetails.css";

interface UserPublicDetailsProps {
  user: UserPublicDTO;
}

const UserPublicDetails: React.FC<UserPublicDetailsProps> = ({ user }) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteAccount = async () => {
    await removeAccount(user.id);
    window.location.reload();
  };

  return (
    <div className="container text-center p-2 mb-4">
      <h2 className="title text-primary mb-3">{user.nickname}</h2>
      <div className="user-public-details d-flex flex-column align-items-center">
        <img
          src={!imgError ? user.pictureURL : userDefaultPic}
          className="rounded-circle border border-primary border-2 mb-3"
          onError={() => setImgError(true)}
          onClick={() => {
            setShowModal(true);
          }}
        />
        {isAdmin() ? (
          //Soy admin, puedo eliminar
          <NeedConfirmButton
            className="btn btn-danger mt-3 ms-2"
            title={t("confirmDeleteAccountTitle")}
            message={t("confirmDeleteAccountMessageADMIN")}
            onConfirm={handleDeleteAccount}
          >
            {t("rmAccount")}
          </NeedConfirmButton>
        ) : (
          getLoggedUserId() != user.id && (
            //No soy admin y tampo es mi cuenta, puedo reportar
            <ReportButton
              className="btn btn-danger mt-3 ms-2 user-public-details-report"
              text={t("reportUser")}
            />
          )
        )}
      </div>
      <ImageModal
        show={showModal}
        image={!imgError ? user.pictureURL : userDefaultPic}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default UserPublicDetails;
