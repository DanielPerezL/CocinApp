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

{
  /*
  TODO:           
    filtros:
      buscar por titulo (+ icono de lupa en navbar, al escribir titulo o pulsar la lupa -> /search (NUEVA PAGINA CON FILTROS))
      filtrar por numero de pasos
      por categorias (TIEMPO, DIFICULTAD, TIPO)
      por contiene x ingrediente
      por NO contiene x ingrediente
  

    rellenar paginas:
      contacto
      sobre nosotros
      politica de privacidad
      terminos de uso
    check de politica de privacidad y terminos de uso en REGISTER
    comprobar web con nombres de usuario largos largos -> capar nombres a X caracteres

    refactoring codigo, pulir detalles:
      errores backend, usar errors.py
      codigo duplicado HACER FUNCIONES BACKEND
      arreglar logout cada vez que se entra a la app ¿?
      arreglar SIGTERM al vaciar el docker ¿?
  */
  /*
  test:
    probar comportamiento correcto incluse con access_token de 5/10 seg

  prod:
    docker_compose
      eliminar export de puerto bd
    config.py
      añadir dominio de origin Ó eliminar cors (INVESTIGAR MEJOR SOLUCION)
      aumentar tiempo access_token 
      jwt_cookie_secure true (funciona bien con ngrok al menos)
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
          <Route path="search" element={<UnderConstructionPage />} />
          <Route path="publish" element={<PublishPage />} />
          <Route path="user/:nickname" element={<UserPage />} />
          <Route path="reports" element={<ReportsPage />} />

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
