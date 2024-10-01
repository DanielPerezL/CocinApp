import React from 'react';
import './App.css';
import NavButtons from './components/NavButtons.js';
import TopNav from './components/TopNav.js';

function App() {
  return (
    <div>
      <TopNav/>
      <header>
        <h1>Bienvenido a CocinApp</h1>
        <p>Descubre y comparte tus recetas favoritas</p>
      </header>
    </div>
    );
}

export default App;
