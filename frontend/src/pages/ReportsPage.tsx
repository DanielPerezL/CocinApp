import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReportsList from "../components/ReportsList";
import { fetchReports } from "../services/apiService";
import { ReportDTO } from "../interfaces";

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportDTO[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      const fetchedReports = await fetchReports(); // Llama a la función para obtener las recetas
      setReports(fetchedReports); // Actualiza el estado con las recetas obtenidas
    };

    loadReports(); // Llama a la función para cargar las recetas
  }, []);

  return (
    <div className="container main-container">
      <div className="d-flex align-items-center justify-content-center">
        <h2>Reports</h2>

        <ReportsList reports={reports} />
      </div>
    </div>
  );
};

export default ReportsPage;
