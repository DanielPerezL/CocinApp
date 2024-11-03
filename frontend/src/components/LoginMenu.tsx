import React, { useState } from "react";
import { login } from "../services/apiService"; // Importa la función de login

const LoginMenu: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [loading, setLoading] = useState<boolean>(false); // Estado para manejar el loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setLoading(true); // Inicia el estado de carga
    setError(null); // Resetea el error antes de intentar el login

    try {
      await login(email, password); // Llama a la función de login
      // Aquí puedes redirigir al usuario a otra página o hacer otra acción en caso de éxito
      console.log("Login exitoso");
      window.location.reload();
    } catch (err: any) {
      setError(err.message); // Captura y muestra el error
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }

    // Limpiar campos de entrada
    setEmail("");
    setPassword("");
  };

  return (
    <div className="login-menu">
      <h2 className="text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>
      {error && <p className="text-danger mt-3">{error}</p>}{" "}
      {/* Mensaje de error */}
    </div>
  );
};

export default LoginMenu;
