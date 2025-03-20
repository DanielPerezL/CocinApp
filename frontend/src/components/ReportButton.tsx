import { useState } from "react";
import { reportResource } from "../services/apiService";
import reportImg from "../assets/report.png";
import NotifyReportModal from "./NotifyReportModal";
import NeedConfirmButton from "./NeedConfirmButton";
import { useTranslation } from "react-i18next";
import "../css/ReportButton.css";

interface ReportButtonProps {
  text: string;
  className: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ text, className }) => {
  const { t } = useTranslation();

  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  return (
    <>
      <NeedConfirmButton
        className={className + " report-button"}
        onConfirm={() => {
          reportResource(window.location.href);
          setShowReportModal(true);
        }}
        message={t("reportButtonMessage")}
        title={text}
      >
        <img className="me-2" src={reportImg}></img>
        {text}
      </NeedConfirmButton>
      <NotifyReportModal
        show={showReportModal}
        onHide={() => {
          setShowReportModal(false);
        }}
      />
    </>
  );
};

export default ReportButton;
