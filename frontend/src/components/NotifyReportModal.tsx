import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap"; // Importar Bootstrap para el modal
import { useTranslation } from "react-i18next";

interface NotifyReportModalProps {
  show: boolean;
  onHide: () => void;
}

const NotifyReportModal: React.FC<NotifyReportModalProps> = ({
  show,
  onHide,
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{t("reportModalTitle")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        <p>{t("reportModalBody")}</p>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotifyReportModal;
