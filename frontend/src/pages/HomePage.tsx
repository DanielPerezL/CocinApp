// src/pages/Home.tsx
import React from "react";
import RecetaCard from "../components/RecetaCard";

// DTO de RECETA
interface Receta {
  title: string;
  image: string;
}

// Array de recetas de ejemplo
const recetasDeEjemplo: Receta[] = [
  {
    title: "Spaghetti Carbonara",
    image: "https://via.placeholder.com/100x100",
  },
  {
    title: "Ensalada César",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Ensalada de Pasta",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Pollo al Curry",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Paella",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Sushi Variado",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Hamburguesa Clásica",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Tacos Mexicanos",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Ratatouille",
    image: "https://via.placeholder.com/300x200",
  },
  {
    title: "Ratatouille 2 (ahora es personal)",
    image: "https://via.placeholder.com/300x200",
  },
];

const Home = () => {
  return (
    <>
      <div className="container main-container my-5">
        <div className="text-center mb-4">
          <h1 className="display-4 text-primary">Bienvenido a CocinApp</h1>
          <p className="fs-5">Descubre y comparte tus recetas favoritas</p>
        </div>
        <div className="row">
          {recetasDeEjemplo.map((receta, index) => (
            <RecetaCard
              key={index}
              titulo={receta.title}
              imagen={receta.image}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
