import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import RecetaPage from "./pages/RecetaPage";
import NoPage from "./pages/NoPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";

// DTOs de RECETA
export interface RecetaGridDTO {
  id: number;
  title: string;
  image: string;
}
export interface RecetaDetailsDTO {
  id: number;
  title: string;
  images: string[];
  ingredientes: string;
  procedimiento: string;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="receta" element={<RecetaPage />} />
          <Route path="favoritas" element={<UnderConstructionPage />} />

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
