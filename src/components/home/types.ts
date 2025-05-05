/**
 * Shared types for home components
 */

/**
 * Interfaz para el modelo de Post
 */
export interface Post {
  id: number;
  contenido: string;
  fecha: string;
  img?: string;
  createdAt?: string;
  updatedAt?: string;
  creador: {
    id: number;
    nombre: string;
    apellido?: string;
    email?: string;
  };
  grupo?: any;
  estadisticas?: {
    likes: number;
    comentarios: number;
  };
}

/**
 * Interfaz para almacenar imágenes de usuarios en caché
 */
export interface UserImagesCache {
  [userId: number]: string;
}

/**
 * Datos para crear un nuevo post
 */
export interface PostData {
  contenido: string;
  creador: {
    id: number | string;
  };
  img?: string;
}

export interface User {
  id?: number | string;
  name?: string;
  email?: string;
}

export interface CommentData {
  postId: number;
  text: string;
} 