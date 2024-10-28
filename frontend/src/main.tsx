import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./css/custom.css"; //COMPILADO CON: sass --watch scss/custom.scss css/custom.css

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
