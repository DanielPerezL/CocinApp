import React, { useState } from "react";
import { UserPublicDTO } from "../interfaces";
import { getImage } from "../services/apiService";
import userDefaultPic from "../assets/user.png";
import { useTranslation } from "react-i18next";
import ImageModal from "./ImagenModal";

interface UserPublicDetailsProps {
  user: UserPublicDTO;
}

const UserPublicDetails: React.FC<UserPublicDetailsProps> = ({ user }) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        {/*<div className="mt-5">
           Agrega aquí otros detalles si es necesario
        </div> */}
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
