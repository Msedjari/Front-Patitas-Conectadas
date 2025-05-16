/**
 * Servicio para manejar operaciones relacionadas con usuarios
 * 
 * Este módulo proporciona funciones para interactuar con la API de usuarios,
 * permitiendo operaciones como obtener detalles de perfil, buscar usuarios,
 * actualizar perfiles y gestionar amigos.
 */
import { config } from '../config';

// Definición de la estructura de datos de Usuario
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  descripcion?: string;
  fecha_nacimiento?: string;
  intereses?: string[];
  ciudad?: string;
  foto?: string;
  created_at?: string;
  updated_at?: string;
}

// Definición para el perfil de usuario que incluye información específica del perfil
export interface UserProfile extends User {
  mascotasCount?: number;
  amigosCount?: number;
}

// Interfaz para crear/actualizar el perfil
export interface UserProfileUpdate {
  nombre?: string;
  apellido?: string;
  descripcion?: string;
  fecha_nacimiento?: string;
  intereses?: string[];
  ciudad?: string;
  foto?: string;
  [key: string]: any;
}

/**
 * Obtiene los headers de autenticación
 * @returns headers con el token de autenticación si existe
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem(config.session.tokenKey);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Obtiene el perfil de un usuario por su ID
 * @param userId ID del usuario
 * @returns Datos del perfil del usuario
 */
export const fetchUserProfile = async (userId?: number): Promise<UserProfile> => {
  try {
    const currentUserId = userId || JSON.parse(localStorage.getItem('user') || '{}').id;
    
    if (!currentUserId) {
      throw new Error('No hay un usuario autenticado o no se proporcionó un ID de usuario');
    }
    
    console.log(`Obteniendo perfil del usuario con ID: ${currentUserId}`);
    
    const response = await fetch(`${config.apiUrl}/usuarios/${currentUserId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Perfil no encontrado');
      }
      throw new Error(`Error al obtener el perfil: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en fetchUserProfile:', error);
    throw error;
  }
};

/**
 * Actualiza el perfil de un usuario
 * @param userId ID del usuario
 * @param profileData Datos actualizados del perfil
 * @returns Perfil actualizado
 */
export const updateUserProfile = async (userId: number, profileData: UserProfileUpdate): Promise<UserProfile> => {
  try {
    console.log(`Actualizando perfil del usuario ${userId} con datos:`, profileData);
    
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al actualizar el perfil: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    throw error;
  }
};

/**
 * Actualiza la foto de perfil de un usuario
 * @param userId ID del usuario
 * @param file Archivo de imagen
 * @returns URL de la imagen actualizada
 */
export const updateProfilePhoto = async (userId: number, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('foto', file);
    
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}/foto`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error al actualizar la foto de perfil: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.fotoUrl || data.foto || data.url || '';
  } catch (error) {
    console.error('Error en updateProfilePhoto:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de amigos de un usuario
 * @param userId ID del usuario
 * @returns Lista de amigos
 */
export const fetchFriendsByUserId = async (userId: number): Promise<User[]> => {
  try {
    console.log(`Obteniendo amigos del usuario con ID: ${userId}`);
    
    const response = await fetch(`${config.apiUrl}/seguidos/usuario/${userId}/seguidos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener los amigos: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.seguidoId,
      nombre: item.seguidoNombre.split(' ')[0],
      apellido: item.seguidoNombre.split(' ').slice(1).join(' '),
      email: '',
      ciudad: ''
    }));
  } catch (error) {
    console.error('Error en fetchFriendsByUserId:', error);
    throw error;
  }
};

/**
 * Busca usuarios por nombre o correo electrónico
 * @param query Texto para buscar usuarios
 * @returns Lista de usuarios que coinciden con la búsqueda
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await fetch(`${config.apiUrl}/usuarios?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al buscar usuarios: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en searchUsers:', error);
    throw error;
  }
};

/**
 * Agrega un amigo (seguir a un usuario)
 * @param userId ID del usuario
 * @param friendId ID del amigo a agregar
 * @returns Confirmación de la operación
 */
export const addFriend = async (userId: number, friendId: number): Promise<{success: boolean; message: string}> => {
  try {
    console.log(`Agregando amigo: Usuario ${userId} agrega a usuario ${friendId}`);
    
    const response = await fetch(`${config.apiUrl}/seguidos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        seguidorId: userId, 
        seguidoId: friendId 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al agregar amigo: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, message: 'Amigo agregado correctamente' };
  } catch (error) {
    console.error('Error en addFriend:', error);
    throw error;
  }
};

/**
 * Elimina un amigo (dejar de seguir)
 * @param userId ID del usuario
 * @param friendId ID del amigo a eliminar
 * @returns Confirmación de la operación
 */
export const removeFriend = async (userId: number, friendId: number): Promise<{success: boolean; message: string}> => {
  try {
    console.log(`Eliminando amigo: Usuario ${userId} elimina a usuario ${friendId}`);
    
    const response = await fetch(`${config.apiUrl}/seguidos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error al buscar relación de seguimiento: ${response.statusText}`);
    }
    
    const seguidos = await response.json();
    const relacion = seguidos.find((s: any) => 
      s.seguidorId === userId && s.seguidoId === friendId
    );
    
    if (!relacion) {
      throw new Error('No se encontró la relación de seguimiento');
    }
    
    const deleteResponse = await fetch(`${config.apiUrl}/seguidos/${relacion.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!deleteResponse.ok) {
      throw new Error(`Error al eliminar amigo: ${deleteResponse.statusText}`);
    }
    
    return { success: true, message: 'Amigo eliminado correctamente' };
  } catch (error) {
    console.error('Error en removeFriend:', error);
    throw error;
  }
}; 