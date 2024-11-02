// DTOs de RECETA
export interface RecipeGridDTO {
  id: number;
  title: string;
  image: string;
}
export interface RecipeDetailsDTO {
  id: number;
  title: string;
  images: string[];
  ingredients: string;
  procedure: string;
}

//DTOs de USUARIO
export interface UserDTO {
  id: number;
  nickname: string;
  email: string;
}
