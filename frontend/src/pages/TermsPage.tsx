import { useTranslation } from "react-i18next";

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">{t("termsTitle")}</h1>
        <p className="fs-5 fw-light">{t("termsSubtitle")}</p>
      </div>
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>{t("termsPoint1Title")}:</strong> {t("termsPoint1")}
            </li>
            <li className="list-group-item">
              <strong>{t("termsPoint2Title")}:</strong> {t("termsPoint2")}
            </li>
            <li className="list-group-item">
              <strong>{t("termsPoint3Title")}:</strong> {t("termsPoint3")}
            </li>
            <li className="list-group-item">
              <strong>{t("termsPoint4Title")}:</strong> {t("termsPoint4")}
            </li>
          </ul>
          <div className="mt-4">
            <p className="fs-5">{t("termsFooter")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
