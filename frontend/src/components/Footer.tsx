import React from "react";
import logo from "../assets/logo.png"; // Ajusta la ruta según tu estructura
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-5 pb-5 pb-md-0">
      <div className="container pb-5 pb-md-0">
        <div className="row">
          <div className="col-md-4 mb-3 ps-3 ps-md-0">
            <h5>{t("navigation")}</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/about" className="text-white text-decoration-none">
                  {t("aboutUs")}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-white text-decoration-none">
                  {t("contact")}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-white text-decoration-none">
                  {t("privacyPolicy")}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-white text-decoration-none">
                  {t("useTerms")}
                </a>
              </li>
            </ul>
          </div>

          {/* Sección de redes sociales */}
          <div className="col-md-4 mb-3 ps-3 ps-md-0">
            <h5>{t("followUs")}</h5>
            <ul className="list-unstyled">
              <li>
                <a
                  href="https://github.com/DanielPerezL/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Sección de derechos de autor */}
          <div className="col-md-4 text-center">
            <img
              src={logo}
              alt="CocinApp Logo"
              className="mb-2"
              style={{ maxWidth: "200px", margin: "0 auto", display: "block" }}
            />
            <p className="mb-4">
              © {currentYear} CocinApp. {t("reserverRights")}
            </p>
            <a
              href="https://www.flaticon.com/"
              className="fw-light text-white text-decoration-none"
            >
              Icons created by Freepik - Flaticon
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
