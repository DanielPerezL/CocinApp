import React from 'react';
import './TopNav.css'; // Asegúrate de crear este archivo para los estilos
import NavButtons from './NavButtons';

function TopNav() {
  return (
    <div>
    <nav class="top-nav">
        <div class="logo-container">
            <img src="img/logo.png" alt="Logo de CocinApp" class="logo-img" id="logo"/>
            <img src="img/icono.png" alt="Icono de CocinApp" class="icono-img" id="icono"/>
        </div>

        <div class="search-container">
            <input type="text" placeholder="Buscar recetas..." class="search-input"/>
        </div>
        <NavButtons/>
    </nav>
    </div>
  );
}

export default TopNav;
