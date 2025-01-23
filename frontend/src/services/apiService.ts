import { t } from "i18next";
import {
  RecipeDetailDTO,
  UserDTO,
  UserPublicDTO,
  ReportDTO,
  CategoryOptions,
  FetchRecipesResponse,
  ConcreteIngredient,
  Ingredient,
} from "../interfaces"; // Asegúrate de ajustar la ruta a tus interfaces.
import { authEvents } from "../events/authEvents";

const NGROK = false;
let API_BASE_URL: string;
let TOKEN_BASE_URL: string;
if (NGROK) {
  // Cadenas de conexion usando NGROK
  API_BASE_URL = `${window.location.protocol}/api`;
  TOKEN_BASE_URL = `${window.location.protocol}/token`;
} else {
  API_BASE_URL = `http://${window.location.hostname}:5000/api`;
  TOKEN_BASE_URL = `http://${window.location.hostname}:5000/token`;
}
export const RECIPE_LIMIT = 20;

export const isLoggedIn = () => {
  return localStorage.getItem("isLoggedIn") == "true";
};

export const isAdmin = () => {
  return localStorage.getItem("isAdmin") == "true";
};

export const getLoggedUserId = () => {
  return localStorage.getItem("loggedUserId");
};

//FUNCIONES SIN LOGIN REQUERIDO
// Función para obtener las categorias de las recetas
export const fetchRecipesCategories = async (): Promise<CategoryOptions[]> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/recipe/categories`);
  } catch (error) {
    throw new Error(t("errorLoadingRecipesCategories"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingRecipesCategories"));
  }
  return await response.json();
};

// Función para obtener las categorias de las recetas
export const fetchIngredients = async (): Promise<Ingredient[]> => {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/recipe/ingredients?lang=${t("lang")}`
    );
  } catch (error) {
    throw new Error(t("errorLoadingRecipesIngredients"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingRecipesIngredients"));
  }
  return await response.json();
};

// Función para obtener recetas
export const fetchRecipes = async (
  offset: number,
  limit?: number
): Promise<FetchRecipesResponse> => {
  return await withTokenRefresh(() => fetchRecipesUnsafe(offset, limit));
};
const fetchRecipesUnsafe = async (
  offset: number,
  limit?: number
): Promise<FetchRecipesResponse> => {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/recipes?offset=${offset}&limit=${
        limit ? limit : RECIPE_LIMIT
      }&lang=${t("lang")}`
    );
  } catch (error) {
    throw new Error(t("errorLoadingRecipes"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingRecipes"));
  }
  return await response.json(); // Devuelve las recetas en formato JSON
};

export const fetchSimilarRecipes = async (
  idRecipe: string,
  offset: number,
  limit?: number
): Promise<FetchRecipesResponse> => {
  return await withTokenRefresh(() =>
    fetchSimilarRecipesUnsafe(idRecipe, offset, limit)
  );
};
const fetchSimilarRecipesUnsafe = async (
  idRecipe: string,
  offset: number,
  limit?: number
): Promise<FetchRecipesResponse> => {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/recipes?recipe_id=${idRecipe}&offset=${offset}&limit=${
        limit ? limit : RECIPE_LIMIT
      }&lang=${t("lang")}`
    );
  } catch (error) {
    throw new Error(t("errorLoadingRecipes"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingRecipes"));
  }
  return await response.json();
};

export const fetchRecipesFavBySimilarUsers = async (
  offset: number,
  limit?: number
): Promise<FetchRecipesResponse> => {
  return await withTokenRefresh(() =>
    fetchRecipesFavBySimilarUsersUnsafe(offset, limit)
  );
};
const fetchRecipesFavBySimilarUsersUnsafe = async (
  offset: number,
  limit?: number
): Promise<FetchRecipesResponse> => {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/recipes?recommendations_for_user_id=${getLoggedUserId()}&offset=${offset}&limit=${
        limit ? limit : RECIPE_LIMIT
      }&lang=${t("lang")}`
    );
  } catch (error) {
    throw new Error(t("errorLoadingRecipes"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingRecipes"));
  }
  return await response.json();
};

// Función para obtener detalles de una receta
export const fetchRecipeDetails = async (id: string) => {
  return await withTokenRefresh(() => fetchRecipeDetailsUnsafe(id));
};
const fetchRecipeDetailsUnsafe = async (
  id: string
): Promise<RecipeDetailDTO> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/recipes/${id}?lang=${t("lang")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
  } catch (error) {
    throw new Error(t("errorLoadingRecipeDetails"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingRecipeDetails"));
  }
  return await response.json();
};

// Funciones para obtener datos de un usuario
export const fetchUserPublicFromNick = async (
  nick: string
): Promise<UserPublicDTO> => {
  return fetchUserPublic(nick);
};
export const fetchUserPublic = async (id: string): Promise<UserPublicDTO> => {
  return withTokenRefresh(() => fetchUserPublicUnsafe(id));
};
const fetchUserPublicUnsafe = async (id: string): Promise<UserPublicDTO> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "GET",
    });
  } catch (error) {
    throw new Error(t("errorLoadingUserDetails"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingUserDetails"));
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

//Funcion para reportar un recurso
export const reportResource = async (resource: string) => {
  return await withTokenRefresh(() => reportResourceUnsafe(resource));
};
const reportResourceUnsafe = async (resource: string): Promise<void> => {
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
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw new Error(t("errorReportingResource"));
  }
  if (!response.ok) {
    throw new Error(t("errorReportingResource"));
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
  try {
    response = await fetch(`${API_BASE_URL}/reports`, {
      method: "GET",
      credentials: "include", // Incluye las cookies en la solicitud
      headers,
    });
  } catch (error) {
    throw new Error(t("errorLoadingReports"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingReports"));
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

  try {
    response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
      method: "PUT",
      credentials: "include", // Incluye las cookies en la solicitud
      headers,
    });
  } catch (error) {
    throw new Error(t("errorSettingReportReviewed"));
  }
  if (!response.ok) {
    throw new Error(t("errorSettingReportReviewed"));
  }
};

export const postIngredients = async (jsonContent: string) => {
  return await withTokenRefresh(() => postIngredientsUnsafe(jsonContent));
};
const postIngredientsUnsafe = async (jsonContent: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(`${API_BASE_URL}/recipe/ingredients`, {
      method: "POST",
      credentials: "include", // Incluye las cookies en la solicitud
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: jsonContent,
    });
  } catch (error) {
    throw new Error(t("errorPostingIngredients"));
  }
  if (!response.ok) {
    throw new Error(t("errorPostingIngredients"));
  }
};

// Función para obtener el perfil del usuario logeado
export const fetchLoggedUserProfile = async () => {
  if (!isLoggedIn()) throw new Error(t("errorLoadingLoggedUser"));
  return await withTokenRefresh(() => fetchLoggedUserProfileUnsafe());
};
const fetchLoggedUserProfileUnsafe = async (): Promise<UserDTO> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(`${API_BASE_URL}/users/${getLoggedUserId()}`, {
      method: "GET",
      credentials: "include", // Incluye las cookies en la solicitud
      headers,
    });
  } catch (error) {
    throw new Error(t("errorLoadingLoggedUser"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingLoggedUser"));
  }
  const data = await response.json();
  if (!data.email) {
    //el back devuelve el dto publico si el token ha expirado, pero quiero el dto privado
    throw new Error(t("errorLoadingLoggedUser"));
  }

  return data;
};

export const fetchUserRecipes = async (id: string, offset: number) => {
  return await withTokenRefresh(() => fetchUserRecipesUnsafe(id, offset));
};
// Función para obtener las recetas de un usario
const fetchUserRecipesUnsafe = async (
  id: string,
  offset: number
): Promise<FetchRecipesResponse> => {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/recipes?user_id=${id}&offset=${offset}&limit=${RECIPE_LIMIT}&lang=${t(
        "lang"
      )}`
    );
  } catch (error) {
    throw new Error(t("errorLoadingUserRecipes"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingUserRecipes"));
  }
  return await response.json();
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
      `${API_BASE_URL}/users/${getLoggedUserId()}/fav_recipes/${id}`,
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
      `${API_BASE_URL}/users/${getLoggedUserId()}/fav_recipes/${id}`,
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

export const fetchMyFavRecipes = async (offset: number) => {
  if (!isLoggedIn()) throw new Error(t("errorLoadingMyFavRecipes"));
  return await withTokenRefresh(() => fetchMyFavRecipesUnsafe(offset));
};
const fetchMyFavRecipesUnsafe = async (
  offset: number
): Promise<FetchRecipesResponse> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/fav_recipes?offset=${offset}&limit=${RECIPE_LIMIT}`,
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

export const addRecipeCart = async (id: string) => {
  return await withTokenRefresh(() => addRecipeCartUnsafe(id));
};
const addRecipeCartUnsafe = async (id: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/cart_recipes/${id}`,
      {
        method: "POST",
        credentials: "include",
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorRemovingCartRecipe"));
  }
  if (!response.ok) {
    throw new Error(t("errorRemovingCartRecipe"));
  }
};

export const rmRecipeCart = async (id: string) => {
  return await withTokenRefresh(() => rmRecipeCartUnsafe(id));
};
const rmRecipeCartUnsafe = async (id: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined
  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/cart_recipes/${id}`,
      {
        method: "DELETE",
        credentials: "include", // Incluye las cookies en la solicitud
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorRemovingCartRecipe"));
  }
  if (!response.ok) {
    throw new Error(t("errorRemovingCartRecipe"));
  }
};

export const fetchMyCartRecipes = async () => {
  if (!isLoggedIn()) throw new Error(t("errorLoadingMyCartRecipes"));
  return await withTokenRefresh(() => fetchMyCartRecipesUnsafe());
};
const fetchMyCartRecipesUnsafe = async (): Promise<FetchRecipesResponse> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}; // Deja los headers vacíos si csrfToken es undefined

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/cart_recipes?lang=${t(
        "lang"
      )}`,
      {
        method: "GET",
        credentials: "include", // Incluye las cookies en la solicitud
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorLoadingMyCartRecipes"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingMyCartRecipes"));
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
  return responseData.filename;
};

// Función para subir una nueva receta al servidor
export const uploadRecipe = async (
  title: string,
  ingredients: ConcreteIngredient[],
  procedure: string[],
  time: string,
  difficulty: string,
  type: string,
  imagePaths: string[]
) => {
  return await withTokenRefresh(() =>
    uploadRecipeUnsafe(
      title,
      ingredients,
      procedure,
      time,
      difficulty,
      type,
      imagePaths
    )
  );
};
const uploadRecipeUnsafe = async (
  title: string,
  ingredients: ConcreteIngredient[],
  procedure: string[],
  time: string,
  difficulty: string,
  type: string,
  imagePaths: string[]
): Promise<string> => {
  let response: Response;
  // Crea el objeto con los datos de la receta
  const recipeData = {
    title,
    ingredients,
    procedure,
    time,
    difficulty,
    type,
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
    response = await fetch(`${API_BASE_URL}/users/${getLoggedUserId()}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Especifica el tipo de contenido
        ...headers,
      },
      credentials: "include", // Incluye las cookies en la solicitud
      body: JSON.stringify(data), // Enviar los datos de la receta en el cuerpo de la solicitud
    });
  } catch (error) {
    throw new Error(t("errorUpdatingProfilePic"));
  }

  if (!response.ok) {
    throw new Error(t("errorUpdatingProfilePic"));
  }
};

export const updatePassword = async (
  current_password: string,
  new_password: string,
  new_password2: string
): Promise<void> => {
  if (new_password != new_password2)
    throw new Error(t("errorUpdatingPasswordNoValidNewPasswords"));
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
    response = await fetch(`${API_BASE_URL}/users/${getLoggedUserId()}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // Especifica el tipo de contenido
        ...headers,
      },
      credentials: "include", // Incluye las cookies en la solicitud
      body: JSON.stringify(data), // Enviar los datos de la receta en el cuerpo de la solicitud
    });
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
  if (!isLoggedIn()) return;
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
    await refreshAccessToken();
    return await asyncFunc();
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
