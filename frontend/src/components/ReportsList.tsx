import React from "react";
import { ReportDTO } from "../interfaces";
import { useTranslation } from "react-i18next";
import { setReportReviewed } from "../services/apiService";

interface ReportsListProps {
  reports: ReportDTO[];
  onChange: () => void;
}

const ReportsList: React.FC<ReportsListProps> = ({ reports, onChange }) => {
  const { t } = useTranslation();

  const handleOpenResource = (resource: string) => {
    const url = `${window.location.origin}${resource}`;
    window.open(url, "_blank");
  };

  const handleSetReviewedReport = async (report: ReportDTO) => {
    await setReportReviewed(report);
    onChange();
  };

  return (
    <div className="reports-list container mt-4">
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="thead-light">
            <tr>
              <th>{t("reportedResource")}</th>
              <th>{t("count")}</th>
              <th>{t("reviewed")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.reported_resource}</td>
                <td>{report.count}</td>
                <td>{report.reviewed ? t("yes") : t("no")}</td>
                <td>
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <button
                      onClick={() => {
                        handleOpenResource(report.reported_resource);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      {t("open")}
                    </button>
                    <button
                      onClick={async () => {
                        await handleSetReviewedReport(report);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      {t("setReviewed")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsList;
