import React, { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import Receta from "./Receta";
import RecetaCard from "../components/RecetaCard";

interface Receta {
  title: string;
  procedure: string;
}

const Home = () => {
  // Estado para almacenar las recetas
  const [recetas, setRecetas] = useState<Receta[]>([]);

  // Función para obtener las recetas desde la API
  const fetchRecetas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/recipes");
      const data = await response.json();
      setRecetas(data);
    } catch (error) {
      console.error("Error al obtener recetas:", error);
    }
  };

  // useEffect para hacer la solicitud a la API una vez que el componente carga
  useEffect(() => {
    fetchRecetas();
  }, []);

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
              titulo={receta.title}
              descripcion={receta.procedure}
            />
          ))}
        </div>
      </div>
    </>
  );
};
export default Home;
