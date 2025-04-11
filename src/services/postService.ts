/**
 * Servicio para manejar operaciones relacionadas con publicaciones (posts)
 * Este archivo contiene todas las funciones para interactuar con la API de publicaciones
 * Incluye operaciones CRUD (crear, leer, actualizar, eliminar) y utilidades relacionadas
 */
import { config } from '../config';

/**
 * Interfaz para el modelo de Post
 * Define la estructura de datos para las publicaciones en la aplicación
 * Propiedades opcionales tienen el signo '?' para indicar que pueden ser nulas
 */
export interface Post {
  id?: number;                // Identificador único del post (opcional para nuevas publicaciones)
  creador_id: number;         // ID del usuario que creó la publicación
  grupo_id?: number;          // ID del grupo al que pertenece la publicación (opcional)
  contenido: string;          // Texto o contenido de la publicación
  fecha: string;              // Fecha de creación de la publicación
  img?: string;               // URL de la imagen asociada a la publicación (opcional)
  usuario?: {                 // Información del usuario creador (opcional, para respuestas de API)
    nombre: string;           // Nombre del usuario
    imagen?: string;          // URL de la imagen de perfil del usuario
  };
  estadisticas?: {            // Estadísticas de interacción (opcional, para respuestas de API)
    likes: number;            // Número de likes que ha recibido la publicación
    comentarios: number;      // Número de comentarios en la publicación
  };
}

/**
 * Obtiene todas las publicaciones desde el backend
 * @returns Promesa que resuelve a un array de publicaciones
 */
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    // La URL base viene del objeto config para mantener centralizada la configuración
    const response = await fetch(`${config.apiUrl}/publicaciones`);
    
    // Verificamos si la respuesta fue exitosa (código 2xx)
    if (!response.ok) {
      throw new Error(`Error al obtener publicaciones: ${response.statusText}`);
    }
    
    // Parseamos la respuesta JSON a un array de publicaciones
    return await response.json();
  } catch (error) {
    // Registramos el error en consola para debugging
    console.error('Error en servicio de publicaciones:', error);
    // Re-lanzamos el error para que los componentes puedan manejarlo
    throw error;
  }
};

/**
 * Obtiene una publicación específica por su ID
 * @param id - ID de la publicación a obtener
 * @returns Promesa que resuelve a un objeto Post
 */
export const fetchPostById = async (id: number): Promise<Post> => {
  try {
    // Hacemos la petición GET a la API con el ID específico
    const response = await fetch(`${config.apiUrl}/publicaciones/${id}`);
    
    // Verificamos si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error al obtener publicación: ${response.statusText}`);
    }
    
    // Parseamos la respuesta JSON a un objeto Post
    return await response.json();
  } catch (error) {
    // Registramos el error con información del ID para facilitar debugging
    console.error(`Error al obtener publicación con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva publicación en el sistema
 * @param postData - Datos de la publicación a crear
 * @returns Promesa que resuelve al objeto Post creado (con ID asignado)
 */
export const createPost = async (postData: Post): Promise<Post> => {
  try {
    // Realizamos la petición POST con los datos de la nueva publicación
    const response = await fetch(`${config.apiUrl}/publicaciones`, {
      method: 'POST',                           // Método HTTP para crear recursos
      headers: {
        'Content-Type': 'application/json',     // Indicamos que enviamos JSON
      },
      body: JSON.stringify(postData),           // Convertimos el objeto a string JSON
    });
    
    // Verificamos si la creación fue exitosa
    if (!response.ok) {
      throw new Error(`Error al crear publicación: ${response.statusText}`);
    }
    
    // Devolvemos la publicación creada (con ID y otros campos generados por el servidor)
    return await response.json();
  } catch (error) {
    console.error('Error al crear publicación:', error);
    throw error;
  }
};

/**
 * Actualiza una publicación existente con nuevos datos
 * @param id - ID de la publicación a actualizar
 * @param postData - Datos parciales o completos a actualizar
 * @returns Promesa que resuelve al objeto Post actualizado
 */
export const updatePost = async (id: number, postData: Partial<Post>): Promise<Post> => {
  try {
    // Realizamos la petición PUT para actualizar el recurso
    // Partial<Post> permite enviar solo los campos que queremos actualizar
    const response = await fetch(`${config.apiUrl}/publicaciones/${id}`, {
      method: 'PUT',                            // Método HTTP para actualizar recursos
      headers: {
        'Content-Type': 'application/json',     // Indicamos que enviamos JSON
      },
      body: JSON.stringify(postData),           // Convertimos los datos parciales a JSON
    });
    
    // Verificamos si la actualización fue exitosa
    if (!response.ok) {
      throw new Error(`Error al actualizar publicación: ${response.statusText}`);
    }
    
    // Devolvemos la publicación actualizada
    return await response.json();
  } catch (error) {
    console.error(`Error al actualizar publicación con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una publicación del sistema
 * @param id - ID de la publicación a eliminar
 * @returns Promesa vacía que se resuelve cuando la eliminación es exitosa
 */
export const deletePost = async (id: number): Promise<void> => {
  try {
    // Realizamos la petición DELETE para eliminar el recurso
    const response = await fetch(`${config.apiUrl}/publicaciones/${id}`, {
      method: 'DELETE',                         // Método HTTP para eliminar recursos
    });
    
    // Verificamos si la eliminación fue exitosa
    if (!response.ok) {
      throw new Error(`Error al eliminar publicación: ${response.statusText}`);
    }
    // No devolvemos datos ya que el recurso ha sido eliminado
  } catch (error) {
    console.error(`Error al eliminar publicación con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las publicaciones de un usuario específico
 * @param userId - ID del usuario cuyas publicaciones se quieren obtener
 * @returns Promesa que resuelve a un array de publicaciones del usuario
 */
export const fetchPostsByUser = async (userId: number): Promise<Post[]> => {
  try {
    // Realizamos la petición para obtener publicaciones filtradas por usuario
    const response = await fetch(`${config.apiUrl}/publicaciones/usuario/${userId}`);
    
    // Verificamos si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error al obtener publicaciones del usuario: ${response.statusText}`);
    }
    
    // Devolvemos el array de publicaciones del usuario
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener publicaciones del usuario ${userId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las publicaciones de un grupo específico
 * @param groupId - ID del grupo cuyas publicaciones se quieren obtener
 * @returns Promesa que resuelve a un array de publicaciones del grupo
 */
export const fetchPostsByGroup = async (groupId: number): Promise<Post[]> => {
  try {
    // Realizamos la petición para obtener publicaciones filtradas por grupo
    const response = await fetch(`${config.apiUrl}/publicaciones/grupo/${groupId}`);
    
    // Verificamos si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error al obtener publicaciones del grupo: ${response.statusText}`);
    }
    
    // Devolvemos el array de publicaciones del grupo
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener publicaciones del grupo ${groupId}:`, error);
    throw error;
  }
};

/**
 * Sube una imagen al servidor y devuelve la URL donde quedó almacenada
 * Utilizada para incluir imágenes en publicaciones
 * @param file - Archivo de imagen a subir
 * @returns Promesa que resuelve a la URL de la imagen subida
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Creamos un objeto FormData para enviar el archivo
    const formData = new FormData();
    // Añadimos el archivo con el nombre 'imagen' que espera el backend
    formData.append('imagen', file);
    
    // Realizamos la petición POST para subir el archivo
    const response = await fetch(`${config.apiUrl}/uploads`, {
      method: 'POST',
      body: formData,                           // FormData ya tiene el Content-Type correcto
    });
    
    // Verificamos si la subida fue exitosa
    if (!response.ok) {
      throw new Error(`Error al subir imagen: ${response.statusText}`);
    }
    
    // Extraemos la URL de la imagen del objeto de respuesta
    const data = await response.json();
    return data.url;                            // Devolvemos solo la URL, no todo el objeto
  } catch (error) {
    console.error('Error al subir imagen:', error);
    throw error;
  }
};

/**
 * Convierte una imagen a formato Base64 para previsualización o almacenamiento
 * Base64 permite representar archivos binarios como texto
 * @param file - Archivo a convertir
 * @returns Promesa que resuelve a la representación Base64 del archivo
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Creamos un FileReader para leer el archivo
    const reader = new FileReader();
    // Iniciamos la lectura del archivo como URL de datos (base64)
    reader.readAsDataURL(file);
    // Manejador de evento cuando la lectura se completa
    reader.onload = () => resolve(reader.result as string);
    // Manejador de evento si ocurre un error
    reader.onerror = error => reject(error);
  });
};