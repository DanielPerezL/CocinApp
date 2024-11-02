// src/pages/Home.tsx
import React from "react";
import RecetaGrid from "../components/RecetaGrid";
import { RecetaGridDTO } from "../App";

// Array de recetas de ejemplo
let recetasDeEjemplo: RecetaGridDTO[] = [
  {
    id: 0,
    title: "Spaghetti Carbonara",
    image: "https://via.placeholder.com/100x100",
  },
  {
    id: 1,
    title: "Ensalada César",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 2,
    title: "Ensalada de Pasta",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 3,
    title: "Pollo al Curry",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 4,
    title: "Paella",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 5,
    title: "Sushi Variado",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 6,
    title: "Hamburguesa Clásica",
    image: "https://via.placeholder.com/300x200",
  },
  {
    id: 7,
    title: "Tacos Mexicanos",
    image: "https://via.placeholder.com/300x200",
  },
  { id: 8, title: "Ratatouille", image: "https://via.placeholder.com/300x200" },
  {
    id: 9,
    title: "Ratatouille 2 (ahora es personal)",
    image: "https://via.placeholder.com/300x200",
  },
];

const Home = () => {
  return (
    <>
      <div className="container my-5">
        <div className="text-center mb-4">
          <h1 className="display-4 text-primary">Bienvenido a CocinApp</h1>
          <p className="fs-5 fw-light">
            Descubre y comparte tus recetas favoritas
          </p>
        </div>
        <RecetaGrid recetas={recetasDeEjemplo} />
      </div>
    </>
  );
};

export default Home;
