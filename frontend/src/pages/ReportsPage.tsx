import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReportsList from "../components/ReportsList";
import { fetchReports, isAdmin } from "../services/apiService";
import { ReportDTO } from "../interfaces";
import NoPage from "./NoPage";
import IngredientUploader from "../components/IngredientUploader";

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportDTO[]>([]);

  const [refresh, setRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshList = () => {
    setLoading(true);
    setRefresh(!refresh);
  };

  useEffect(() => {
    const loadReports = async () => {
      const fetchedReports = await fetchReports();
      setReports(fetchedReports);
      setLoading(false);
    };

    loadReports();
  }, [refresh]);

  if (!isAdmin()) return <NoPage />;
  return (
    <div className="container mb-5 main-container text-center">
      <h1 className="display-5 text-primary mb-4">{t("reports")}</h1>
      {loading && <p className="fs-6 fw-light">{t("loadingReports")}</p>}
      {!loading && reports.length == 0 && (
        <>
          <p className="fs-6 fw-light">{t("noReports")}</p>
          <button className="btn btn-primary" onClick={refreshList}>
            {t("refresh")}
          </button>
        </>
      )}
      {!loading && reports.length > 0 && (
        <ReportsList reports={reports} onChange={refreshList} />
      )}

      <IngredientUploader />
    </div>
  );
};

export default ReportsPage;
