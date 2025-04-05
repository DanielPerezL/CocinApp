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
  LoginResponse,
} from "../interfaces";
import { authEvents } from "../events/authEvents";

const RENDER = import.meta.env.VITE_RENDER === "true"; //ENTORNO DE PRODUCCIÓN
let API_BASE_URL: string;
let AUTH_BASE_URL: string;
if (RENDER) {
  // Cadenas de conexion usando RENDER
  API_BASE_URL = `${window.location.protocol}/api`;
  AUTH_BASE_URL = `${window.location.protocol}/api/auth`;
} else {
  API_BASE_URL = `http://${window.location.hostname}:5000/api`;
  AUTH_BASE_URL = `http://${window.location.hostname}:5000/api/auth`;
}
export const RECIPE_LIMIT = Number(import.meta.env.VITE_RECIPE_LIMIT) || 20;

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
    response = await fetch(`${API_BASE_URL}/recipes/categories`);
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
      `${API_BASE_URL}/recipes/ingredients?lang=${t("lang")}`
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
      `${API_BASE_URL}/recipes/${idRecipe}/similars?offset=${offset}&limit=${
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
      `${API_BASE_URL}/users/${getLoggedUserId()}/recommendations?offset=${offset}&limit=${
        limit ? limit : RECIPE_LIMIT
      }&lang=${t("lang")}`,
      {
        method: "GET",
      }
    );
  } catch (error) {
    throw new Error(t("errorLoadingRecipes"));
  }

  if (!response.ok) {
    throw new Error(t("errorLoadingRecipes"));
  }
  return await response.json();
};

export const fetchRecipesBySearch = async (
  offset: number,
  limit?: number,
  title?: string, // Buscar por título
  minSteps?: number, // Número mínimo de pasos
  maxSteps?: number, // Número máximo de pasos
  time?: string[], // Filtrar por tiempo
  difficulty?: string[], // Filtrar por dificultad
  type?: string, // Filtrar por tipo
  containsIngredients?: string[], // IDs de ingredientes que debe contener
  excludesIngredients?: string[] // IDs de ingredientes que no debe contener
): Promise<FetchRecipesResponse> => {
  return await withTokenRefresh(() =>
    fetchRecipesBySearchUnsafe(
      offset,
      limit,
      title,
      minSteps,
      maxSteps,
      time,
      difficulty,
      type,
      containsIngredients,
      excludesIngredients
    )
  );
};

const fetchRecipesBySearchUnsafe = async (
  offset: number,
  limit?: number,
  title?: string,
  minSteps?: number,
  maxSteps?: number,
  time?: string[],
  difficulty?: string[],
  type?: string,
  containsIngredients?: string[],
  excludesIngredients?: string[]
): Promise<FetchRecipesResponse> => {
  let queryParams = `offset=${offset}&limit=${
    limit ? limit : RECIPE_LIMIT
  }&lang=${t("lang")}`;

  // Agregar los parámetros de búsqueda condicionalmente
  if (title !== undefined && title.length >= 0) {
    queryParams += `&title=${encodeURIComponent(title)}`;
  }
  if (minSteps !== undefined) {
    queryParams += `&min_steps=${minSteps}`;
  }
  if (maxSteps !== undefined) {
    queryParams += `&max_steps=${maxSteps}`;
  }
  if (time && time.length > 0) {
    time.forEach((id) => {
      queryParams += `&time=${encodeURIComponent(id)}`;
    });
  }
  if (difficulty && difficulty.length > 0) {
    difficulty.forEach((id) => {
      queryParams += `&difficulty=${encodeURIComponent(id)}`;
    });
  }
  if (type !== undefined && type.length >= 0) {
    queryParams += `&type=${encodeURIComponent(type)}`;
  }
  if (containsIngredients && containsIngredients.length > 0) {
    containsIngredients.forEach((id) => {
      queryParams += `&c_i=${id}`;
    });
  }
  if (excludesIngredients && excludesIngredients.length > 0) {
    excludesIngredients.forEach((id) => {
      queryParams += `&e_i=${id}`;
    });
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/recipes?${queryParams}`);
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
    const errorMessage = responseData.message.toLowerCase(); // Convertir a minúsculas para comparar sin problemas
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
    response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    throw new Error(t("errorLogin"));
  }

  const responseData = await response.json();
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(t("errorLoginUserNotFound"));
    }
    if (response.status === 401) {
      throw new Error(t("errorLoginBadPassword"));
    }
    throw new Error(t("errorLogin"));
  }

  const location = response.headers.get("Location");
  if (!location) {
    throw new Error(t("errorLogin"));
  }

  const id = location.split("/").pop();
  if (!id) {
    throw new Error(t("errorLogin"));
  }

  const loginOkData: LoginResponse = responseData;
  // Indicar que el usuario ha iniciado sesión
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("loggedUserId", id);
  localStorage.setItem("isAdmin", loginOkData.isAdmin);
  authEvents.emit("login");
};

// Función para hacer logout (NECESITA LOGIN PERO SI DA ERROR NO SE NECESITA TRATAR)
export const logout = async (): Promise<void> => {
  const response = await fetch(`${AUTH_BASE_URL}/logout`, {
    method: "POST",
  });

  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedUserId");
  localStorage.removeItem("isAdmin");
  authEvents.emit("logout");
};

//Funcion para reportar un recurso
export const reportResource = async (resource: string) => {
  return await withTokenRefresh(() => reportResourceUnsafe(resource));
};
const reportResourceUnsafe = async (resource: string): Promise<void> => {
  let response: Response;
  const data = { reported_resource: resource };
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  try {
    response = await fetch(`${API_BASE_URL}/reports`, {
      method: "GET",
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
      method: "PUT",
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(`${API_BASE_URL}/recipes/ingredients`, {
      method: "POST",
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(`${API_BASE_URL}/users/${getLoggedUserId()}`, {
      method: "GET",
      headers,
    });
  } catch (error) {
    throw new Error(t("errorLoadingLoggedUser"));
  }
  if (!response.ok) {
    throw new Error(t("errorLoadingLoggedUser"));
  }
  const data = await response.json();
  if (!data.email || data.email.length == 0) {
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
      `${API_BASE_URL}/users/${id}/recipes?&offset=${offset}&limit=${RECIPE_LIMIT}&lang=${t(
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/favourites/${id}`,
      {
        method: "POST",
        headers,
      }
    );
  } catch (error) {
    throw new Error(t("errorAddingFavRecipe"));
  }
  if (!response.ok) {
    throw new Error(t("errorAddingFavRecipe"));
  }
};

export const rmRecipeFav = async (id: string) => {
  return await withTokenRefresh(() => rmRecipeFavUnsafe(id));
};
const rmRecipeFavUnsafe = async (id: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/favourites/${id}`,
      {
        method: "DELETE",
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/favourites?offset=${offset}&limit=${RECIPE_LIMIT}`,
      {
        method: "GET",
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/cart/${id}`,
      {
        method: "POST",
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/cart/${id}`,
      {
        method: "DELETE",
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(
      `${API_BASE_URL}/users/${getLoggedUserId()}/cart?lang=${t("lang")}`,
      {
        method: "GET",
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

  // Crear un FormData para enviar la imagen
  const formData = new FormData();
  formData.append("image", imageFile);

  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  try {
    response = await fetch(`${API_BASE_URL}/images`, {
      method: "POST",
      headers,
      body: formData, // Enviar la imagen en el cuerpo de la solicitud
    });
  } catch (error) {
    throw new Error(t("errorUploadingImage"));
  }

  if (!response.ok) {
    throw new Error(t("errorUploadingImage"));
  }

  const location = response.headers.get("Location");
  if (!location) {
    throw new Error(t("errorUploadingImage"));
  }

  const filename = location.split("/").pop();
  if (!filename) {
    throw new Error(t("errorUploadingImage"));
  }
  return filename;
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
    images: imagePaths,
  };

  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  try {
    response = await fetch(`${API_BASE_URL}/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(recipeData),
    });
  } catch (error) {
    throw new Error(t("errorUploadingRecipe"));
  }

  if (!response.ok) {
    throw new Error(t("errorUploadingRecipe"));
  }

  const location = response.headers.get("Location");
  if (!location) {
    throw new Error(t("errorUploadingRecipe"));
  }

  const id = location.split("/").pop();
  if (!id) {
    throw new Error(t("errorUploadingRecipe"));
  }

  return id;
};

export const updateRecipe = async (
  id: string, // ID de la receta a actualizar
  title?: string,
  ingredients?: ConcreteIngredient[],
  procedure?: string[],
  time?: string,
  difficulty?: string,
  type?: string,
  imagePaths?: string[]
) => {
  return await withTokenRefresh(() =>
    updateRecipeUnsafe(
      id,
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

const updateRecipeUnsafe = async (
  id: string, // ID de la receta a actualizar
  title?: string,
  ingredients?: ConcreteIngredient[],
  procedure?: string[],
  time?: string,
  difficulty?: string,
  type?: string,
  imagePaths?: string[]
): Promise<void> => {
  let response: Response;

  const recipeData: Record<string, any> = {};
  if (title !== undefined) recipeData.title = title;
  if (ingredients !== undefined) recipeData.ingredients = ingredients;
  if (procedure !== undefined) recipeData.procedure = procedure;
  if (time !== undefined) recipeData.time = time;
  if (difficulty !== undefined) recipeData.difficulty = difficulty;
  if (type !== undefined) recipeData.type = type;
  if (imagePaths !== undefined) recipeData.images = imagePaths;

  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

  try {
    response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(recipeData),
    });
  } catch (error) {
    throw new Error(t("errorUpdatingRecipe"));
  }

  if (!response.ok) {
    throw new Error(t("errorUpdatingRecipe"));
  }
};

// Función para actualizar imagen de perfil
export const updateProfilePic = async (imagePath: string): Promise<void> => {
  return await withTokenRefresh(() => updateProfilePicUnsafe(imagePath));
};
const updateProfilePicUnsafe = async (imagePath: string): Promise<void> => {
  let response: Response;
  const csrfToken = getCookie("csrf_access_token");
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  const data = { picture: imagePath };

  try {
    response = await fetch(`${API_BASE_URL}/users/${getLoggedUserId()}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  const data = {
    current_password: current_password,
    new_password: new_password,
  };
  try {
    response = await fetch(`${API_BASE_URL}/users/${getLoggedUserId()}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
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
  const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
  try {
    response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
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
    const response = await fetch(`${AUTH_BASE_URL}/refresh`, {
      method: "POST",
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
  //POR SEGURIDAD EN ALGUNOS CASOS -> EVITAR SITUACIONES INCONSISTENTES
  if (isLoggedIn() && !getCookie("csrf_access_token"))
    await refreshAccessToken();

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
