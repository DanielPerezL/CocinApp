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
import ReportsPage from "./pages/ReportsPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

{
  /*
  TODO:   
    Registro:
      Al registrarse, login automático con pop-up informativo-> /profile
      nombres case insensitive: comprobar error con Antonio

    Publish y RecieEditor:
      Indicar por qué no se puede publicar -> ademas de desactivar el button
      
    
    COMENTAR CODIGO
    AUMENTAR ACCESS TOKEN AGE -> 15 minutos
    CAMBIAR DOMINIO DE NUEVO
    ELIMINAR EXPORT BD PORT












    Mejoras MEMORIA:
      Componente imagenes para tener preview
      Sugerir nuevos ingredientes que no existen en la web
      Foto de perfil en navbuttons
      Opciones de reportes -> motivo de reporte 
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
          <Route path="cart" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="publish" element={<PublishPage />} />
          <Route path="user/:nickname" element={<UserPage />} />
          <Route path="reports" element={<ReportsPage />} />

          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
