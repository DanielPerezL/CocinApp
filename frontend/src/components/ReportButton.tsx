import { useState } from "react";
import { reportResource } from "../services/apiService";
import reportImg from "../assets/report.png";
import NotifyReportModal from "./NotifyReportModal";

interface ReportButtonProps {
  text: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ text }) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  return (
    <>
      <button
        className="btn btn-danger"
        onClick={() => {
          reportResource(window.location.pathname + window.location.search);
          setShowReportModal(true);
        }}
      >
        <img
          className="me-2 img-fluid"
          style={{ width: "2rem", height: "auto" }}
          src={reportImg}
        ></img>
        {text}
      </button>
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
