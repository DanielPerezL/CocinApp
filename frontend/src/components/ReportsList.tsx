import React, { useState } from "react";
import { ReportDTO } from "../interfaces";
import { useTranslation } from "react-i18next";
import { setReportReviewed } from "../services/apiService";

interface ReportsListProps {
  reports: ReportDTO[];
}

const ReportsList: React.FC<ReportsListProps> = ({ reports }) => {
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState<boolean>(true);

  const handleOpenResource = (resource: string) => {
    const url = `${window.location.origin}${resource}`;
    window.open(url, "_blank");
  };

  const handleSetReviewedReport = (report: ReportDTO) => {
    setReportReviewed(report);
    report.reviewed = true;
    setRefresh(!refresh);
  };

  return (
    <div className="reports-list">
      {reports.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Reported Resource</th>
              <th>Count</th>
              <th>Reviewed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.reported_resource}</td>
                <td>{report.count}</td>
                <td>{report.reviewed ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => handleOpenResource(report.reported_resource)}
                    className="btn btn-primary btn-sm"
                  >
                    {t("open")}
                  </button>
                  <button
                    onClick={() => handleSetReviewedReport(report)}
                    className="btn btn-secondary btn-sm"
                  >
                    {t("setReviewed")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reports available.</p>
      )}
    </div>
  );
};

export default ReportsList;
