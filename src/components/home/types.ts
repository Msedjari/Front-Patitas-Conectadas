/**
 * Shared types for home components
 */

/**
 * Interfaz para el modelo de Post
 */
export interface Post {
  id: number;
  contenido: string;
  fecha?: string;
  img?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Campos originales cuando el creador viene como objeto anidado
  creador?: {
    id: number;
    nombre: string;
    apellido?: string;
    email?: string;
  };
  
  // Campos nuevos para la estructura plana que viene de la API
  creadorId?: number;
  nombreCreador?: string;
  apellidoCreador?: string;
  
  // Otros campos opcionales
  comentarios?: Comment[];
  grupoId?: number | null;
  nombreGrupo?: string | null;
  grupo?: any;
  estadisticas?: {
    likes: number;
    comentarios: number;
  };
}

/**
 * Interfaz para el modelo de Comentario
 * Esta interfaz sigue la estructura de la API para los comentarios
 */
export interface Comment {
  id: number;
  postId: number;
  creadorId: number;
  nombreCreador: string;
  apellidoCreador?: string;
  contenido: string;
  fecha: string;
  img?: string;
}

/**
 * Interfaz para almacenar imágenes de usuarios en caché
 */
export interface UserImagesCache {
  [userId: number]: string;
}

/**
 * Datos para crear un nuevo post
 * 
 * La PostData se usa solo en la comunicación entre componentes de frontend.
 * Al enviar al backend, se reformatea según las expectativas de la API.
 */
export interface PostData {
  contenido: string;
  creador: {
    id: number | string;
  };
  img?: string;
}

/**
 * Datos para crear un nuevo comentario
 * 
 * CommentData se usa para la comunicación entre componentes de frontend.
 * Al enviar al backend, se reformatea según las expectativas de la API.
 */
export interface CommentData {
  postId: number;
  contenido: string;
  creadorId: number;
}

export interface User {
  id?: number | string;
  name?: string;
  email?: string;
} 