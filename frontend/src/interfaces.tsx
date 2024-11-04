// DTOs de RECETA
export interface RecipeSimpleDTO {
  id: number;
  title: string;
  image: string;
}
export interface RecipeDetailDTO {
  id: number;
  user_id: number;
  title: string;
  images: string;
  ingredients: string;
  procedure: string;
}

//DTOs de USUARIO
export interface UserDTO {
  id: number;
  nickname: string;
  email: string;
}
