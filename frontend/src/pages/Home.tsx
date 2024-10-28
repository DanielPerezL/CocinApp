import React from "react";
import Navbar from "../components/NavBar";
import Receta from "./Receta";
import RecetaCard from "../components/RecetaCard";

interface Receta {
  titulo: string;
}

const Home = () => {
  const recetas = [
    { titulo: "Tortilla" },
    { titulo: "Huevo frito" },
    { titulo: "Ensalada César" },
    { titulo: "Pasta al pesto" },
  ];

  return (
    <>
      <div className="container my-5">
        <div className="text-center mb-4">
          <h1 className="display-4 text-primary">Bienvenido a CocinApp</h1>
          <p className="fs-5">Descubre y comparte tus recetas favoritas</p>
        </div>
        <div className="row">
          {recetas.map((receta, index) => (
            <RecetaCard
              key={index}
              titulo={receta.titulo}
              descripcion={"Esta es la receta nº " + (index + 1)}
            />
          ))}
        </div>
      </div>
    </>
  );
};
export default Home;
