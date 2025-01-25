import React from "react";
import { Modal } from "react-bootstrap";
import "../css/ImagenModal.css";

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
        className="imagen-modal d-flex justify-content-center align-items-center p-0"
        onClick={onClose}
      >
        <img src={image} />
      </Modal.Body>
    </Modal>
  );
};

export default ImageModal;
