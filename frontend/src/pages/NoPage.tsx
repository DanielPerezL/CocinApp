import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NoPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="d-flex align-items-center justify-content-center main-container">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <p className="fs-3">
          <span className="text-danger">{t("errorOops") + " "}</span>
          {t("errorPageNotFound")}
        </p>
        <p className="lead">{t("errorRemovedOrMoved")}</p>
        <Link
          to="/"
          className="btn btn-primary"
          onClick={() => {
            window.scrollTo(0, 0);
          }}
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
};

export default NoPage;
