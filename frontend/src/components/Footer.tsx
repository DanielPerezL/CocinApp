import React from "react";
import logo from "../assets/logo.png"; // Ajusta la ruta según tu estructura

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-5 pb-5 pb-md-0">
      <div className="container pb-5 pb-md-0">
        <div className="row">
          {/* Sección de enlaces de navegación */}
          <div className="col-md-4 mb-3 ms-3 ms-md-0">
            <h5>Navegación</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/about" className="text-white text-decoration-none">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="/contact" className="text-white text-decoration-none">
                  Contacto
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-white text-decoration-none">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="/terms" className="text-white text-decoration-none">
                  Términos de Uso
                </a>
              </li>
            </ul>
          </div>

          {/* Sección de redes sociales */}
          <div className="col-md-4 mb-3 ms-3 ms-md-0">
            <h5>Síguenos</h5>
            <ul className="list-unstyled">
              <li>
                <a
                  href="https://github.com/Zice37/"
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
            <p className="mb-0">
              © {currentYear} CocinApp. Ningún derecho reservado.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
