import React, { useState } from "react";
import { UserPublicDTO } from "../interfaces";
import {
  getImage,
  getLoggedUserId,
  isAdmin,
  removeAccount,
  reportResource,
} from "../services/apiService";
import userDefaultPic from "../assets/user.png";
import { useTranslation } from "react-i18next";
import ImageModal from "./ImagenModal";
import NeedConfirmButton from "./NeedConfirmButton";
import report from "../assets/report.png";
import NotifyReportModal from "./NotifyReportModal";
import ReportButton from "./ReportButton";

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
      <div className="d-flex flex-column align-items-center">
        <img
          src={!imgError ? getImage(user.picture) : userDefaultPic}
          className="rounded-circle border border-primary border-2 mb-3"
          style={{ width: "10rem", height: "10rem", objectFit: "cover" }}
          onError={() => setImgError(true)}
          onClick={() => {
            setShowModal(true);
          }}
        />
        {isAdmin() && (
          <NeedConfirmButton
            className="btn btn-danger mt-3 ms-2"
            buttonText={t("rmAccount")}
            title={t("confirmDeleteAccountTitle")}
            message={t("confirmDeleteAccountMessageADMIN")}
            onConfirm={handleDeleteAccount}
          />
        )}
        {!isAdmin() && getLoggedUserId() != user.id && (
          <ReportButton text={t("reportUser")} />
        )}
      </div>
      <ImageModal
        show={showModal}
        image={!imgError ? getImage(user.picture) : userDefaultPic}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default UserPublicDetails;
