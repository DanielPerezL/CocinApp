// src/services/apiService.ts

import { RecipeSimpleDTO, RecipeDetailDTO, UserDTO } from "../interfaces"; // Asegúrate de ajustar la ruta a tus interfaces.

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

// Función para obtener recetas
export const fetchRecipes = async (): Promise<RecipeSimpleDTO[]> => {
  const response = await fetch(`${API_BASE_URL}/recipes_simple_dto`); // Ajusta la URL según tu API
  if (!response.ok) {
    throw new Error("Error al obtener recetas");
  }
  return await response.json(); // Devuelve las recetas en formato JSON
};

// Función para hacer login
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
    throw new Error(data.error || "Login failed");
  }

  const responseData = await response.json();
  const { access_token, refresh_token } = responseData;

  // Almacena los tokens en localStorage
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
  localStorage.setItem("isLoggedIn", "true");
};

// Función para hacer logout
export const logout = () => {
  /*await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Usando el token almacenado
    },
  });*/

  // Eliminar los tokens del localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("isLoggedIn");
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

// Función para obtener todos los usuarios
export const fetchUsers = async (): Promise<UserDTO[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return await response.json();
};

// Función para obtener el perfil del usuario logeado
export const fetchLoggedUserProfile = async (): Promise<UserDTO> => {
  const response = await fetch(`${API_BASE_URL}/logged_user_profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Usando el token almacenado
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
): Promise<RecipeDetailDTO> => {
  const response = await fetch(`${API_BASE_URL}/recipe_details_dto?id=${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to fetch recipe details");
  }
  return await response.json();
};

//Función para registrar un nuevo usuario
export const registerUser = async (
  nickname: string,
  email: string,
  password: string
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname, email, password }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error || "Failed to register user");
  }
  return responseData.msg;
};

// Función para subir una imagen al servidor y retornar la ruta de la imagen
export const uploadImage = async (imageFile: File): Promise<string> => {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error("User is not authenticated");
  }

  // Crea un FormData para enviar la imagen
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`, // Usando el token almacenado
    },
    body: formData, // Enviar la imagen en el cuerpo de la solicitud
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const responseData = await response.json();
  return responseData.filename; // Se asume que el servidor responde con la ruta de la imagen
};

export const getImage = (filename: string): string => {
  // Aquí retornamos la URL completa de la imagen
  return `${API_BASE_URL}/images/${filename}`;
};

// Función para subir una nueva receta al servidor
export const uploadRecipe = async (
  title: string,
  ingredients: string,
  procedure: string,
  imagePaths: string[]
): Promise<string> => {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error("User is not authenticated");
  }

  // Crea el objeto con los datos de la receta
  const recipeData = {
    title,
    ingredients,
    procedure,
    images: imagePaths, // Puedes renombrar la clave si es necesario en el servidor
  };

  const response = await fetch(`${API_BASE_URL}/new_recipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Especifica el tipo de contenido
      Authorization: `Bearer ${accessToken}`, // Usando el token almacenado
    },
    body: JSON.stringify(recipeData), // Enviar los datos de la receta en el cuerpo de la solicitud
  });

  if (!response.ok) {
    const errorData = await response.json(); // Captura cualquier mensaje de error del servidor
    throw new Error(errorData.error || "Failed to upload recipe");
  }

  const responseData = await response.json();
  return responseData.msg; // Se asume que el servidor responde con un mensaje de éxito
};
