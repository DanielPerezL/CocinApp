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

{
  /*
  TODO:

    ACTUALIZAR SOLO COMPONENTES (evitar window.location.reload())
    i18n -> REVISAR CAMBIAR FOTO DE PERFIL
    lista publica de tus recetas (PAGINA DE PERFIL PUBLICA)
    
    https?
    wcag?

    
    fotos usuarios:
      fotos solo cuadradas

    categorías:
      (tiempo, dificultad, por ingredientes principales…)

    modificar INPUT ingredientes:
      lista de la compra

    modificar INPUT pasos:
      visualización más llamativa
      filtrar por pocos pasos

    gestion de cuentas:
      cambiar contraseña
      eliminar cuenta

    gestion de recetas:
      eliminar receta
      modificar receta
      
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
