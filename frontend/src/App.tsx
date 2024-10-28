import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Receta from "./pages/Receta";
import NoPage from "./pages/NoPage";
import UnderConstruction from "./pages/UnderConstruction";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="receta" element={<Receta />} />
          <Route path="about" element={<UnderConstruction />} />
          <Route path="contact" element={<UnderConstruction />} />
          <Route path="privacy" element={<UnderConstruction />} />
          <Route path="terms" element={<UnderConstruction />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
