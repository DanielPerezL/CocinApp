import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import RecetaPage from "./pages/RecipePage";
import NoPage from "./pages/NoPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import PublishPage from "./pages/PublishPage";
import UserPage from "./pages/UserPage";

{
  /*
  TODO: 
    gestion de recetas:
      modificar receta

    modificar INPUT pasos:
      tabla receta usa coleecion de pasos
  
    categorías:
      (tiempo, dificultad, ingredientes)
      tabla ENUM_TIEMPO (-20min, 20-40, 40-90, +90min)
      tabla ENUM_DIFICULTAD (facil/easy, medio/medium, dificil/hard, experto/expert)

    modificar INPUT ingredientes:
      tabla de INGREDIENTE (nombre_es, nombre_en, unidad por defecto)
      tabla de INGREDIENTE_CONCRETO (fk_INGREDIENTE, cantidad)
      tabla receta usa coleecion de ingrediente concreto

    filtros:
      buscar por titulo (+ icono de lupa en navbar, al escribir titulo o pulsar la lupa -> /search (NUEVA PAGINA CON FILTROS))
      filtrar por numero de pasos
      por categorias
    
    funcionalidad:
      lista de la compra
      rol de administrador / moderador
      IMPLEMENTAR SCROLL INFINITO Y QUE NO SE CARGEN TODAS LAS RECETAS A LA VEZ

    FUERA (prototipo):
      wcag
      ¿IMPLEMENTAR CACHE PARA REDUCIR CONSULTAS A BBDD? -> p.e. FAVORITAS (cuidado concurrencia de usuarios multidispositivo)
      
  */
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="recipe" element={<RecetaPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="publish" element={<PublishPage />} />
          <Route path="user/:nickname" element={<UserPage />} />

          <Route path="about" element={<UnderConstructionPage />} />
          <Route path="contact" element={<UnderConstructionPage />} />
          <Route path="privacy" element={<UnderConstructionPage />} />
          <Route path="terms" element={<UnderConstructionPage />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
