// Footer.tsx

import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        <div className="row">
          {/* Sección de enlaces de navegación */}
          <div className="col-md-4 mb-3">
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
          <div className="col-md-4 mb-3">
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
          <div className="col-md-4 text-center text-md-left">
            <img
              src="/img/logo.png"
              alt="CocinApp Logo"
              className="mb-2"
              style={{ maxWidth: "200px" }}
            />
            <p className="mb-0">
              © {currentYear} CocinApp. Ningun derecho reservado.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
