import { useTranslation } from "react-i18next";

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <main className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">{t("contact")}</h1>
        <p className="fs-5 fw-light">{t("contactSubtitle")}</p>
      </div>
      <div className="col-md-8 offset-md-2 text-center">
        <p className="fs-5">
          {t("contactMessage")}{" "}
          <a
            href="https://www.linkedin.com/in/daniel-pérez-lópez"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-underline text-primary fw-bold"
          >
            LinkedIn
          </a>
          .
        </p>
      </div>
    </main>
  );
};

export default ContactPage;
