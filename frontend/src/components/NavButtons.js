import React from 'react';
import './NavButtons.css'; // Asegúrate de crear este archivo para los estilos

const NavButtons = () => {
  return (
    <div>
      <nav className="nav-buttons">
        <button className="nav-btn" title="Favoritos">
          <img src="img/corazon.png" alt="Favoritos" />
        </button>
        <button className="nav-btn" title="Cesta de la compra">
          <img src="img/cesta.png" alt="Cesta de la compra" />
        </button>
        <button className="nav-btn" title="Publicar receta">
          <img src="img/publicar.png" alt="Publicar receta" />
        </button>
        <button className="nav-btn" title="Perfil">
          <img src="img/usuario.png" alt="Perfil" />
        </button>
      </nav>
    </div>
  );
};

export default NavButtons;
