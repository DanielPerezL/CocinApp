// src/services/apiService.ts

import { RecipeSimpleDTO, RecipeDetailDTO, UserDTO } from "../interfaces"; // Asegúrate de ajustar la ruta a tus interfaces.

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;
const TOKEN_BASE_URL = `http://${window.location.hostname}:5000/token`;

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
    credentials: "include", // Permite que las cookies sean enviadas y recibidas
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Login failed");
  }

  // Indicar que el usuario ha iniciado sesión
  localStorage.setItem("isLoggedIn", "true");
};

// Función para hacer logout
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include", // Incluye las cookies en la solicitud para que el backend pueda eliminarlas
  });

  if (!response.ok) {
    //NOS DA IGUAL SI DA ERROR REALMENTE
    console.error("Error during logout");
  }
  // Eliminar el indicador de inicio de sesión
  localStorage.removeItem("isLoggedIn");
};

export const fetchMyRecipes = async () => {
  return await withTokenRefresh(fetchMyRecipesUnsafe);
};
const fetchMyRecipesUnsafe = async () => {
  const response = await fetch(`${API_BASE_URL}/my_recipes`, {
    method: "GET",
    credentials: "include", // Incluye las cookies en la solicitud
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
export const fetchLoggedUserProfile = async () => {
  return await withTokenRefresh(fetchLoggedUserProfileUnsafe);
};
const fetchLoggedUserProfileUnsafe = async (): Promise<UserDTO> => {
  const response = await fetch(`${API_BASE_URL}/logged_user_profile`, {
    method: "GET",
    credentials: "include", // Incluye las cookies en la solicitud
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
  return await withTokenRefresh(() => uploadImageUnsafe(imageFile));
};
const uploadImageUnsafe = async (imageFile: File): Promise<string> => {
  // Crea un FormData para enviar la imagen
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    credentials: "include", // Incluye las cookies en la solicitud
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
  return await withTokenRefresh(() =>
    uploadRecipeUnsafe(title, ingredients, procedure, imagePaths)
  );
};
const uploadRecipeUnsafe = async (
  title: string,
  ingredients: string,
  procedure: string,
  imagePaths: string[]
): Promise<string> => {
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
    },
    credentials: "include", // Incluye las cookies en la solicitud
    body: JSON.stringify(recipeData), // Enviar los datos de la receta en el cuerpo de la solicitud
  });

  if (!response.ok) {
    const errorData = await response.json(); // Captura cualquier mensaje de error del servidor
    throw new Error(errorData.error || "Failed to upload recipe");
  }

  const responseData = await response.json();
  return responseData.msg; // Se asume que el servidor responde con un mensaje de éxito
};

// Función para refrescar el token de acceso
let isRefreshingToken = false;
const refreshAccessToken = async (): Promise<void> => {
  if (isRefreshingToken) {
    // Espera si otro proceso ya está refrescando el token
    while (isRefreshingToken) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Espera 100 ms
    }
    return;
  }
  isRefreshingToken = true;
  try {
    const response = await fetch(`${TOKEN_BASE_URL}/refresh`, {
      method: "POST",
      credentials: "include", // Incluye las cookies en la solicitud
    });

    if (!response.ok) {
      const data = await response.json();
      await logout(); // Desloguear al usuario si falla el refresco
      console.error(data.error || "Error al refrescar el token de acceso");
      return;
    }

    console.log("Access token refreshed successfully");
  } finally {
    isRefreshingToken = false;
  }
};

// Función auxiliar para manejar la renovación del token de acceso
const withTokenRefresh = async <T>(asyncFunc: () => Promise<T>): Promise<T> => {
  try {
    return await asyncFunc(); // Intentar ejecutar la función original
  } catch (error) {
    if (error instanceof Error) {
      await refreshAccessToken();
      if (!localStorage.getItem("isLoggedIn"))
        throw new Error("Sesión expirada.");

      try {
        return await asyncFunc();
      } catch (err) {
        if (err instanceof Error) throw err;
      }
    }
    // Si no es un error de autorización, lanza el error original
    throw error;
  }
};
