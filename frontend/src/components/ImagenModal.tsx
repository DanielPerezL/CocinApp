import React from "react";
import { Modal } from "react-bootstrap";

interface ImageModalProps {
  show: boolean;
  image: string;
  onClose: () => void; // Función para cerrar el modal
}

const ImageModal: React.FC<ImageModalProps> = ({ show, image, onClose }) => {
  return (
    <Modal
      show={show}
      centered
      dialogClassName="modal-dialog-custom"
      onHide={onClose}
    >
      <Modal.Body
        className="d-flex justify-content-center align-items-center p-0"
        onClick={onClose}
      >
        <img
          src={image}
          style={{
            width: "100%", // Ocupa todo el ancho del contenedor
            height: "100%", // Ocupa todo el alto del contenedor
            maxWidth: "80vw", // Ancho máximo
            maxHeight: "80vh", // Alto máximo
            objectFit: "contain", // Escala la imagen manteniendo la relación de aspecto
          }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default ImageModal;
