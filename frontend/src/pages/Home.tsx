import React from "react";
import Navbar from "../components/NavBar";

const Home = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">
          Bienvenido a CocinApp
        </h1>
        <p className="fs-3">Descubre y comparte tus recetas favoritas</p>
      </div>
    </div>
  );
};
export default Home;
