import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../css/ProfileCropModal.css";

interface ProfilePicCropProps {
  image: string; // URL de la imagen a recortar
  onClose: () => void; // Cerrar el modal
  onSave: (croppedImage: File) => void; // Guardar la imagen recortada
}

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<File> => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error();
  }
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error());
        return;
      }
      resolve(new File([blob], "croppedImage.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
};

const ProfilePicCrop: React.FC<ProfilePicCropProps> = ({
  image,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      throw new Error();
    }
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onSave(croppedImage);
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{t("cropImage")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        <div className="crop-modal">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProfilePicCrop;
