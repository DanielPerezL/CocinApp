import { t } from "i18next";
import {
  RecipeSimpleDTO,
  RecipeDetailDTO,
  UserDTO,
  UserPublicDTO,
  ReportDTO,
} from "../interfaces"; // Asegúrate de ajustar la ruta a tus interfaces.
import { authEvents } from "../events/authEvents";

//const API_BASE_URL = `http://${window.location.hostname}:5000/api`;
//const TOKEN_BASE_URL = `http://${window.location.hostname}:5000/token`;

// Cadenas de conexion usando NGROK
const API_BASE_URL = `${window.location.protocol}/api`;
const TOKEN_BASE_URL = `${window.location.protocol}/token`;
//*/

//FUNCIONES SIN LOGIN REQUERIDO

export const isLoggedIn = () => {
  return localStorage.getItem("isLoggedIn") == "true";
};

export const isAdmin = () => {
  return localStorage.getItem("isAdmin") == "true";
};

export const getLoggedUserId = () => {
  return localStorage.getItem("loggedUserId");
};

// Función para obtener recetas
export const fetchRecipes = async (): Promise<RecipeSimpleDTO[]> => {
  //TOKEN OPCIONAL
  if (isLoggedIn()) return await withTokenRefresh(() => fetchRecipesUnsafe());
  return await fetchRecipesUnsafe();
};
const fetchRecipesUnsafe = async (): Promise<RecipeSimpleDTO[]> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/recipes`);
  } catch (error) {
    throw new Error(t("errorLoadingRecipes"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingRecipes"));
  }
  return await response.json(); // Devuelve las recetas en formato JSON
};

// Función para obtener detalles de una receta
export const fetchRecipeDetails = async (
  id: string
): Promise<RecipeDetailDTO> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/recipes/${id}`);
  } catch (error) {
    throw new Error(t("errorLoadingRecipeDetails"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingRecipeDetails"));
  }
  return await response.json();
};

// Función para obtener detalles de una receta
export const fetchUserPublic = async (id: string): Promise<UserPublicDTO> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/users/${id}`);
  } catch (error) {
    throw new Error(t("errorLoadingRecipeDetails"));
  }
  if (!response.ok) {
    const data = await response.json();
    throw new Error(t("errorLoadingUserDetails"));
  }
  return await response.json();
};

export const fetchUserPublicFromNick = async (
  nick: string
): Promise<UserPublicDTO> => {
  return fetchUserPublic(nick);
};

// Función para obtener las recetas de un usario
export const fetchUserRecipes = async (
  id: string
): Promise<RecipeSimpleDTO[]> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/recipes?user_id=${id}`);
  } catch (error) {
    throw new Error(t("errorLoadingUserRecipes"));
  }
  if (!response.ok) {
    const data = await response.json();
    throw new Error(t("errorLoadingUserRecipes"));
  }
  return await response.json();
};

//Función para registrar un nuevo usuario
export const registerUser = async (
  nickname: string,
  email: string,
  password: string
): Promise<string> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname, email, password }),
    });
  } catch (error) {
    throw new Error(t("errorRegister"));
  }
  if (!response.ok) {
    const responseData = await response.json();
    const errorMessage = responseData.error.toLowerCase(); // Convertir a minúsculas para comparar sin problemas
    if (errorMessage.includes("email")) {
      throw new Error(t("errorRegisterEmailExists"));
    }
    if (errorMessage.includes("nombre")) {
      throw new Error(t("errorRegisterNameExists"));
    }
    throw new Error(t("errorRegister"));
  }
  return t("registerSuccesfully");
};

// Función para hacer login
export const login = async (email: string, password: string): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Permite que las cookies sean enviadas y recibidas
    });
  } catch (error) {
    throw new Error(t("errorLogin"));
  }

  const responseData = await response.json();
  if (!response.ok) {
    const errorMessage = responseData.error.toLowerCase(); // Convertir a minúsculas para comparar sin problemas
    if (errorMessage.includes("email")) {
      throw new Error(t("errorLoginUserNotFound"));
    }
    if (errorMessage.includes("contraseña")) {
      throw new Error(t("errorLoginBadPassword"));
    }
    throw new Error(t("errorLogin"));
  }

  // Indicar que el usuario ha iniciado sesión
  authEvents.emit("login");
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("loggedUserId", responseData.id);
  localStorage.setItem("isAdmin", responseData.isAdmin);
};

// Aquí retornamos la URL completa de la imagen
export const getImage = (filename: string): string => {
  if (!filename) return "";
  return `${API_BASE_URL}/images/${filename}`;
};

// Función para hacer logout (NECESITA LOGIN PERO SI DA ERROR NO SE NECESITA TRATAR)
export const logout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    credentials: "include", // Incluye las cookies en la solicitud para que el backend pueda eliminarlas
  });

  authEvents.emit("logout");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedUserId");
  localStorage.removeItem("isAdmin");
};

export const reportResource = async (resource: string): Promise<void> => {
  let response: Response;
  const data = { reported_resource: resource };
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include", // Permite que las cookies sean enviadas y recibidas
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};

//FUNCIONES CON LOGIN REQUERIDO

export const fetchReports = async () => {
  return await withTokenRefresh(() => fetchReportsUnsafe());
};
const fetchReportsUnsafe = async (): Promise<ReportDTO[]> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  response = await fetch(`${API_BASE_URL}/reports`, {
    method: "GET",
    credentials: "include", // Incluye las cookies en la solicitud
    headers,
  });
  if (!response.ok) {
    return [];
  }
  return await response.json();
};

export const setReportReviewed = async (report: ReportDTO) => {
  return await withTokenRefresh(() => setReportReviewedUnsafe(report));
};
const setReportReviewedUnsafe = async (report: ReportDTO): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
    method: "PUT",
    credentials: "include", // Incluye las cookies en la solicitud
    headers,
  });
};

// Función para obtener el perfil del usuario logeado
export const fetchLoggedUserProfile = async () => {
  return await withTokenRefresh(() => fetchLoggedUserProfileUnsafe());
};
const fetchLoggedUserProfileUnsafe = async (): Promise<UserDTO> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${localStorage.getItem("loggedUserId")}`,
      {
        method: "GET",
        credentials: "include", // Incluye las cookies en la solicitud
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorLoadingLoggedUser"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingLoggedUser"));
  }

  return await response.json();
};

export const fetchMyRecipes = async () => {
  return await withTokenRefresh(() => fetchMyRecipesUnsafe());
};
const fetchMyRecipesUnsafe = async (): Promise<RecipeSimpleDTO[]> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  try {
    response = await fetch(
      `${API_BASE_URL}/recipes?user_id=${localStorage.getItem("loggedUserId")}`,
      {
        method: "GET",
        credentials: "include", // Incluye las cookies en la solicitud
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorLoadingMyRecipes"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingMyRecipes"));
  }

  return await response.json();
};

export const isFavoriteRecipe = async (id: string): Promise<boolean> => {
  if (!isLoggedIn()) return false;

  try {
    const favs: RecipeSimpleDTO[] = await fetchMyFavRecipes();
    return favs.some((recipe) => recipe.id === id);
  } catch (error) {
    return false;
  }
};

export const addRecipeFav = async (id: string) => {
  return await withTokenRefresh(() => addRecipeFavUnsafe(id));
};
const addRecipeFavUnsafe = async (id: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${localStorage.getItem(
        "loggedUserId"
      )}/fav_recipes/${id}`,
      {
        method: "POST",
        credentials: "include",
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorAddingFavRecipe"));
  }
  if (!response.ok) {
    throw new Error(t("errorAddingFavRecipe"));
  }
  return await response.json();
};

export const rmRecipeFav = async (id: string) => {
  return await withTokenRefresh(() => rmRecipeFavUnsafe(id));
};
const rmRecipeFavUnsafe = async (id: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  try {
    response = await fetch(
      `${API_BASE_URL}/users/${localStorage.getItem(
        "loggedUserId"
      )}/fav_recipes/${id}`,
      {
        method: "DELETE",
        credentials: "include", // Incluye las cookies en la solicitud
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorRemovingFavRecipe"));
  }
  if (!response.ok) {
    throw new Error(t("errorRemovingFavRecipe"));
  }
};

export const fetchMyFavRecipes = async () => {
  return await withTokenRefresh(() => fetchMyFavRecipesUnsafe());
};
const fetchMyFavRecipesUnsafe = async (): Promise<RecipeSimpleDTO[]> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${localStorage.getItem(
        "loggedUserId"
      )}/fav_recipes`,
      {
        method: "GET",
        credentials: "include", // Incluye las cookies en la solicitud
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorLoadingMyFavRecipes"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingMyFavRecipes"));
  }

  return await response.json();
};

// Función para subir una imagen al servidor y retornar la ruta de la imagen
export const uploadImage = async (imageFile: File): Promise<string> => {
  return await withTokenRefresh(() => uploadImageUnsafe(imageFile));
};
const uploadImageUnsafe = async (imageFile: File): Promise<string> => {
  let response: Response;
  const formData = new FormData();
  formData.append("image", imageFile);

  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  try {
    // Crea un FormData para enviar la imagen

    response = await fetch(`${API_BASE_URL}/images`, {
      method: "POST",
      credentials: "include", // Incluye las cookies en la solicitud
      headers,
      body: formData, // Enviar la imagen en el cuerpo de la solicitud
    });
  } catch (error) {
    throw new Error(t("errorUploadingImage"));
  }

  if (!response.ok) {
    throw new Error(t("errorUploadingImage"));
  }

  const responseData = await response.json();
  return responseData.filename; // Se asume que el servidor responde con la ruta de la imagen
};

// Función para subir una nueva receta al servidor
export const uploadRecipe = async (
  title: string,
  ingredients: string,
  procedure: string,
  imagePaths: string[]
) => {
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
  let response: Response;

  // Crea el objeto con los datos de la receta
  const recipeData = {
    title,
    ingredients,
    procedure,
    images: imagePaths, // Puedes renombrar la clave si es necesario en el servidor
  };

  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  try {
    response = await fetch(`${API_BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Especifica el tipo de contenido
        ...headers,
      },
      credentials: "include", // Incluye las cookies en la solicitud
      body: JSON.stringify(recipeData), // Enviar los datos de la receta en el cuerpo de la solicitud
    });
  } catch (error) {
    throw new Error(t("errorUploadingRecipe"));
  }

  if (!response.ok) {
    throw new Error(t("errorUploadingRecipe"));
  }

  const responseData = await response.json();
  return responseData.new_id;
};

// Función para actualizar imagen de perfil
export const updateProfilePic = async (imagePath: string): Promise<void> => {
  return await withTokenRefresh(() => updateProfilePicUnsafe(imagePath));
};
const updateProfilePicUnsafe = async (imagePath: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  const data = { picture: imagePath };

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${localStorage.getItem("loggedUserId")}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Especifica el tipo de contenido
          ...headers,
        },
        credentials: "include", // Incluye las cookies en la solicitud
        body: JSON.stringify(data), // Enviar los datos de la receta en el cuerpo de la solicitud
      }
    );
  } catch (error) {
    throw new Error(t("errorUpdatingProfilePic"));
  }

  if (!response.ok) {
    throw new Error(t("errorUpdatingProfilePic"));
  }
};

export const updatePassword = async (
  current_password: string,
  new_password: string
): Promise<void> => {
  return await withTokenRefresh(() =>
    updatePasswordUnsafe(current_password, new_password)
  );
};
const updatePasswordUnsafe = async (
  current_password: string,
  new_password: string
): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  const data = {
    current_password: current_password,
    new_password: new_password,
  };
  try {
    response = await fetch(
      `${API_BASE_URL}/users/${localStorage.getItem("loggedUserId")}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Especifica el tipo de contenido
          ...headers,
        },
        credentials: "include", // Incluye las cookies en la solicitud
        body: JSON.stringify(data), // Enviar los datos de la receta en el cuerpo de la solicitud
      }
    );
  } catch (error) {
    throw new Error(t("errorUpdatingPassword"));
  }

  if (!response.ok) {
    throw new Error(t("errorUpdatingPassword"));
  }
};

// Función para eliminar imagen de perfil
export const removeProfilePic = async (): Promise<void> => {
  return await withTokenRefresh(() => updateProfilePicUnsafe(""));
};

// Función para eliminar un perfil
export const removeAccount = async (id: string): Promise<void> => {
  return await withTokenRefresh(() => removeAccountUnsafe(id));
};
const removeAccountUnsafe = async (id: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  try {
    response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include",
    });
  } catch (error) {
    throw new Error(t("errorUpdatingProfilePic??"));
  }

  if (!response.ok) {
    throw new Error(t("errorUpdatingProfilePic??"));
  }
  if (id == getLoggedUserId()) logout();
};

export const removeRecipe = async (idR: string): Promise<void> => {
  if (!localStorage.getItem("isLoggedIn")) return;
  return await withTokenRefresh(() => removeRecipeUnsafe(idR));
};
const removeRecipeUnsafe = async (idR: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  try {
    response = await fetch(`${API_BASE_URL}/recipes/${idR}`, {
      method: "DELETE",
      headers: {
        ...headers,
      },
      credentials: "include", // Incluye las cookies en la solicitud
    });
  } catch (error) {
    throw new Error(t("errorDeletingRecipe"));
  }

  if (!response.ok) {
    throw new Error(t("errorDeletingRecipe"));
  }
};

// FUNCIONES AUXILIARES MANEJO COOKIES Y SESION

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
    const csrfToken = getCookie("csrf_refresh_token");
    const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
    const response = await fetch(`${TOKEN_BASE_URL}/refresh`, {
      method: "POST",
      credentials: "include", // Incluye las cookies en la solicitud
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      await logout(); // Desloguear al usuario si falla el refresco
      const msg = t("errorExpiredSession");
      alert(msg);
      throw new Error(msg);
    }
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

const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
};
