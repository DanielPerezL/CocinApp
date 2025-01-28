import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface NeedConfirmButtonProps {
  title: string;
  message: string;
  className: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

const NeedConfirmButton: React.FC<NeedConfirmButtonProps> = ({
  title,
  message,
  className,
  onConfirm,
  children,
}) => {
  const { t } = useTranslation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <button className={className} onClick={() => setShowConfirmModal(true)}>
        {children}
      </button>

      <Modal show={showConfirmModal} onHide={handleCancel} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <p>{message}</p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleCancel}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            {t("confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NeedConfirmButton;
