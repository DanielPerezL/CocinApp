// src/services/apiService.ts

import { RecipeGridDTO, RecipeDetailsDTO, UserDTO } from "../interfaces"; // Asegúrate de ajustar la ruta a tus interfaces.

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

// Función para obtener recetas
export const fetchRecipes = async (): Promise<RecipeGridDTO[]> => {
  const response = await fetch(`${API_BASE_URL}/recipes_simple_dto`); // Ajusta la URL según tu API
  if (!response.ok) {
    throw new Error("Error al obtener recetas");
  }
  return await response.json(); // Devuelve las recetas en formato JSON
};

// Función para obtener las recetas del usuario logeado
export const fetchMyRecipes = async () => {
  const accessToken = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/my_recipes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Usando el token almacenado
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch protected data");
  }

  return await response.json();
};

export const login = async (email: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.msg || "Login failed");
  }

  const responseData = await response.json();
  const { access_token, refresh_token } = responseData;

  // Almacena los tokens en localStorage
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
  localStorage.setItem("isLoggedIn", "true");
};
// Función para hacer logout
export const logout = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Usando el token almacenado
    },
  });

  // Eliminar los tokens del localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("isLoggedIn");
};

{
  /*TESTEAR*/
}

// Función para obtener todos los usuarios
export const fetchUsers = async (): Promise<UserDTO[]> => {
  console.log("fetchUsers()");
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  console.log(response.json());
  return await response.json();
};

// Función para obtener el perfil del usuario logeado
export const fetchLoggedUserProfile = async (): Promise<UserDTO> => {
  const accessToken = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/logged_user_profile`, {
    method: "GET",
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "", // Asegúrate de que no sea undefined
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch protected data");
  }

  return await response.json();
};

// Función para obtener detalles de una receta
export const fetchRecipeDetails = async (
  id: string
): Promise<RecipeDetailsDTO> => {
  const response = await fetch(`${API_BASE_URL}/recipe_details_dto?id=${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.msg || "Failed to fetch recipe details");
  }
  return await response.json();
};

//Función para registrar un nuevo usuario
export const registerUser = async (
  nickname: string,
  email: string,
  password: string
): Promise<void> => {
  console.log("registerUser");

  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname, email, password }),
  });

  if (!response.ok) {
    console.log(response.json());
    const data = await response.json();
    throw new Error(data.msg || "Failed to register user");
  }
  console.log(response.json());
};
