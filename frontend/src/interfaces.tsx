// DTOs de RECETA
export interface RecipeSimpleDTO {
  id: string;
  title: string;
  image: string;
}

export interface RecipeDetailDTO {
  id: string;
  user_id: string;
  title: string;
  images: string;
  ingredients: string;
  procedure: string;
}

//DTOs de USUARIO
export interface UserDTO {
  id: string;
  nickname: string;
  picture: string;
  email: string;
}

export interface UserPublicDTO {
  nickname: string;
  picture: string;
}
