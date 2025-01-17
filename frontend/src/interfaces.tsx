// DTOs de RECETA
export interface RecipeSimpleDTO {
  id: string;
  title: string;
  image: string;
  time: string;
  difficulty: string;
}

export interface RecipeDetailDTO {
  id: string;
  user_id: string;
  title: string;
  isFav: boolean;
  time: string;
  difficulty: string;
  type: string;
  images: string[];
  ingredients: string;
  procedure: string[];
}

//DTOs de USUARIO
export interface UserDTO {
  id: string;
  nickname: string;
  picture: string;
  email: string;
}

export interface UserPublicDTO {
  id: string;
  nickname: string;
  picture: string;
}

export interface ReportDTO {
  id: string;
  reported_resource: string;
  count: number;
  reviewed: boolean;
}

export interface CategoryOptions {
  name: "time" | "difficulty" | "type";
  options: string[];
}
