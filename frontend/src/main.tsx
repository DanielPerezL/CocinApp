import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./css/customBootstrap/custom.css"; //COMPILADO CON: sass -q ./scss/custom.scss ./css/customBootstrap/custom.css
import "./css/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
