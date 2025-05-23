// DTOs de RECETA
export interface RecipeSimpleDTO {
  id: string;
  title: string;
  imageURL: string;
  time: string;
  difficulty: string;
  type: string;
  ingredients: ConcreteIngredient[];
  url: string;
}

export interface Ingredient {
  id: string;
  name: string;
  default_unit: string;
}

export interface ConcreteIngredient extends Ingredient {
  amount: string;
}

export interface RecipeDetailDTO {
  id: string;
  user_id: string;
  title: string;
  isFav: boolean;
  isCart: boolean;
  time: string;
  difficulty: string;
  type: string;
  imagesURL: string[];
  ingredients: ConcreteIngredient[];
  procedure: string[];
}

export interface CategoryOptions {
  name: "time" | "difficulty" | "type";
  options: string[];
}

//DTOs de USUARIO
export interface UserDTO {
  id: string;
  nickname: string;
  pictureURL: string;
  email: string;
}

export interface UserPublicDTO {
  id: string;
  nickname: string;
  pictureURL: string;
}

export interface ReportDTO {
  id: string;
  reported_resource: string;
  count: number;
}

export interface FetchRecipesResponse {
  recipes: RecipeSimpleDTO[];
  has_more: boolean;
}

export interface LoginResponse {
  isAdmin: string;
}
