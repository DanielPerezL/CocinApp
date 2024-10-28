import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

//PARA DESARROLLAR UTILIZAR PALETA POR DEFECTO Y CAMBIARLA SOLO PARA HACER LA BUILD A PRODUCCION
import "bootstrap/dist/css/bootstrap.css";
//import "./scss/custom.scss";
//JUSTIFICAR LOS WARNING AL USO INTERNO DE @import EN BOOTSTRAP

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
