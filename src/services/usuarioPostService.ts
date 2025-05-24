import { config } from '../config';

interface UsuarioPost {
  id: number;
  postId: number;
  usuarioId: number;
  fecha: string;
}

/**
 * Crea una relación entre un usuario y un post (guardar post)
 */
export const guardarPost = async (usuarioId: number, postId: number): Promise<UsuarioPost> => {
  const token = localStorage.getItem(config.session.tokenKey);
  if (!token) throw new Error('No hay token de autenticación');

  const response = await fetch(`${config.apiUrl}/usuario-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ usuarioId, postId })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || 'Error al guardar el post');
  }

  return response.json();
};

/**
 * Elimina una relación entre un usuario y un post (quitar de guardados)
 */
export const quitarPostGuardado = async (usuarioId: number, postId: number): Promise<void> => {
  const token = localStorage.getItem(config.session.tokenKey);
  if (!token) throw new Error('No hay token de autenticación');

  // Primero obtenemos todas las relaciones del usuario
  const response = await fetch(`${config.apiUrl}/usuario-post/usuario/${usuarioId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener los posts guardados');
  }

  const relaciones: UsuarioPost[] = await response.json();
  const relacion = relaciones.find(r => r.postId === postId);

  if (!relacion) {
    throw new Error('El post no está guardado');
  }

  // Eliminamos la relación específica
  const deleteResponse = await fetch(`${config.apiUrl}/usuario-post/${relacion.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!deleteResponse.ok) {
    throw new Error('Error al quitar el post de guardados');
  }
};

/**
 * Verifica si un post está guardado por un usuario
 */
export const estaPostGuardado = async (usuarioId: number, postId: number): Promise<boolean> => {
  const token = localStorage.getItem(config.session.tokenKey);
  if (!token) throw new Error('No hay token de autenticación');

  const response = await fetch(`${config.apiUrl}/usuario-post/usuario/${usuarioId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al verificar si el post está guardado');
  }

  const relaciones: UsuarioPost[] = await response.json();
  return relaciones.some(r => r.postId === postId);
}; 