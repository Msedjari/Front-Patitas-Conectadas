/**
 * Servicio para manejar operaciones relacionadas con comentarios
 * Este archivo contiene todas las funciones para interactuar con la API de comentarios
 * Incluye operaciones CRUD (crear, leer, actualizar, eliminar) y utilidades relacionadas
 */
import { config } from '../config';
import { Comment, CommentData } from '../components/home/types';

/**
 * Obtiene los comentarios de una publicación específica
 * @param postId - ID del post cuyos comentarios se quieren obtener
 * @returns Promesa que resuelve a un array de comentarios
 */
export const fetchCommentsByPost = async (postId: number): Promise<Comment[]> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    const response = await fetch(`${config.apiUrl}/posts/${postId}/comentarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener comentarios: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener comentarios del post ${postId}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo comentario en una publicación
 * @param commentData - Datos del comentario a crear
 * @returns Promesa que resuelve al comentario creado
 */
export const createComment = async (commentData: CommentData): Promise<Comment> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    // Crear el objeto de datos según el formato que espera la API
    const dataToSend = {
      postId: commentData.postId,
      creadorId: Number(commentData.creadorId),
      contenido: commentData.contenido
    };
    
    const response = await fetch(`${config.apiUrl}/posts/${commentData.postId}/comentarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(dataToSend),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || 'Error desconocido al crear el comentario';
      throw new Error(`Error: ${response.status} - ${errorMessage}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al crear comentario:', error);
    throw error;
  }
};

/**
 * Obtiene un comentario específico por su ID
 * @param commentId - ID del comentario a obtener
 * @returns Promesa que resuelve al comentario
 */
export const fetchCommentById = async (commentId: number): Promise<Comment> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    const response = await fetch(`${config.apiUrl}/comentarios/${commentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener comentario: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener comentario ${commentId}:`, error);
    throw error;
  }
};

/**
 * Actualiza un comentario existente
 * @param commentId - ID del comentario a actualizar
 * @param contenido - Nuevo contenido del comentario
 * @returns Promesa que resuelve al comentario actualizado
 */
export const updateComment = async (commentId: number, contenido: string): Promise<Comment> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    const response = await fetch(`${config.apiUrl}/comentarios/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ contenido }),
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar comentario: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al actualizar comentario ${commentId}:`, error);
    throw error;
  }
};

/**
 * Elimina un comentario existente
 * @param commentId - ID del comentario a eliminar
 * @returns Promesa que resuelve a un mensaje de confirmación
 */
export const deleteComment = async (commentId: number): Promise<{ mensaje: string }> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    const response = await fetch(`${config.apiUrl}/comentarios/${commentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error al eliminar comentario: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al eliminar comentario ${commentId}:`, error);
    throw error;
  }
};

/**
 * Obtiene el número de comentarios de una publicación específica
 * @param postId - ID del post cuyo conteo de comentarios se quiere obtener
 * @returns Promesa que resuelve al número de comentarios
 */
export const fetchCommentCountByPost = async (postId: number): Promise<number> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    if (!token) {
      throw new Error('No hay token disponible');
    }
    
    const response = await fetch(`${config.apiUrl}/posts/${postId}/comentarios/count`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // Si el endpoint no existe, usamos el método alternativo de obtener todos los comentarios
        const comments = await fetchCommentsByPost(postId);
        return comments.length;
      }
      throw new Error(`Error al obtener conteo de comentarios: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error(`Error al obtener conteo de comentarios del post ${postId}:`, error);
    // En caso de error, intentamos obtener todos los comentarios como fallback
    try {
      const comments = await fetchCommentsByPost(postId);
      return comments.length;
    } catch (fallbackError) {
      console.error('Error en fallback para obtener conteo de comentarios:', fallbackError);
      return 0;
    }
  }
}; 