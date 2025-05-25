/**
 * Servicio de Mascotas para Patitas Conectadas
 *
 * Este módulo proporciona funciones para interactuar con la API de mascotas,
 * permitiendo operaciones como obtener detalles de mascotas, crear, actualizar
 * y eliminar mascotas.
 */
import { config } from '../config';

/**
 * Interfaz para el modelo de Mascota
 */
export interface Mascota {
  id?: number;
  usuarioId: number;
  nombre: string;
  genero: string;
  raza: string;
  foto?: string;
}

/**
 * Obtiene todas las mascotas de un usuario específico
 * 
 * @param usuarioId - ID del usuario propietario de las mascotas
 * @returns Promesa que resuelve a un array de objetos Mascota
 * @throws Error si la petición falla
 */
export const fetchMascotasByUserId = async (usuarioId: number): Promise<Mascota[]> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('El usuario no existe');
      }
      throw new Error('Error al obtener las mascotas del usuario');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    throw error;
  }
};

/**
 * Obtiene una mascota específica por su ID
 * 
 * @param usuarioId - ID del usuario propietario de la mascota
 * @param mascotaId - ID de la mascota a obtener
 * @returns Promesa que resuelve a un objeto Mascota
 * @throws Error si la mascota no existe o la petición falla
 */
export const fetchMascotaById = async (usuarioId: number, mascotaId: number): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas/${mascotaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('La mascota no existe o no pertenece al usuario');
      }
      throw new Error('Error al obtener la mascota');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener mascota:', error);
    throw error;
  }
};

/**
 * Crea una nueva mascota para un usuario
 * 
 * @param usuarioId - ID del usuario propietario de la mascota
 * @param mascotaData - Datos de la mascota a crear
 * @returns Promesa que resuelve al objeto Mascota creado
 * @throws Error si la creación falla
 */
export const createMascota = async (usuarioId: number, mascotaData: Omit<Mascota, 'id' | 'usuarioId'>): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Validar campos obligatorios
    if (!mascotaData.nombre || !mascotaData.genero || !mascotaData.raza) {
      throw new Error('El nombre, género y raza son campos obligatorios');
    }
    
    // Validar longitud de campos
    if (mascotaData.genero.length > 10) {
      throw new Error('El género debe tener un máximo de 10 caracteres');
    }
    
    if (mascotaData.nombre.length > 50 || mascotaData.raza.length > 50) {
      throw new Error('El nombre y la raza deben tener un máximo de 50 caracteres');
    }
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mascotaData)
    });
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('El usuario no existe');
      }
      throw new Error('Error al crear la mascota');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al crear mascota:', error);
    throw error;
  }
};

/**
 * Actualiza una mascota existente
 * 
 * @param usuarioId - ID del usuario propietario de la mascota
 * @param mascotaId - ID de la mascota a actualizar
 * @param mascotaData - Datos actualizados de la mascota
 * @returns Promesa que resuelve al objeto Mascota actualizado
 * @throws Error si la actualización falla
 */
export const updateMascota = async (
  usuarioId: number,
  mascotaId: number,
  mascotaData: Omit<Mascota, 'id' | 'usuarioId'>
): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Validar campos obligatorios
    if (!mascotaData.nombre || !mascotaData.genero || !mascotaData.raza) {
      throw new Error('El nombre, género y raza son campos obligatorios');
    }
    
    // Validar longitud de campos
    if (mascotaData.genero.length > 10) {
      throw new Error('El género debe tener un máximo de 10 caracteres');
    }
    
    if (mascotaData.nombre.length > 50 || mascotaData.raza.length > 50) {
      throw new Error('El nombre y la raza deben tener un máximo de 50 caracteres');
    }
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas/${mascotaId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mascotaData)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('La mascota no existe o no pertenece al usuario');
      }
      throw new Error('Error al actualizar la mascota');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    throw error;
  }
};

/**
 * Elimina una mascota
 * 
 * @param usuarioId - ID del usuario propietario de la mascota
 * @param mascotaId - ID de la mascota a eliminar
 * @returns Promesa que resuelve a un mensaje de confirmación
 * @throws Error si la eliminación falla
 */
export const deleteMascota = async (usuarioId: number, mascotaId: number): Promise<{ mensaje: string }> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas/${mascotaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('La mascota no existe o no pertenece al usuario');
      }
      throw new Error('Error al eliminar la mascota');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    throw error;
  }
};

/**
 * Actualiza la foto de una mascota
 * 
 * @param mascotaId - ID de la mascota cuya foto se actualizará
 * @param userId - ID del usuario propietario de la mascota
 * @param file - Archivo de imagen a subir
 * @returns Promesa que resuelve a un objeto con la URL de la nueva foto
 * @throws Error si la actualización falla
 */
export const updateMascotaFoto = async (mascotaId: number, userId: number, file: File): Promise<{ url: string }> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Crear un FormData para enviar el archivo
    const formData = new FormData();
    formData.append('foto', file);
    
    // Esta ruta puede variar según la documentación específica de la API
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}/mascotas/${mascotaId}/foto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    // Verificar si la actualización fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al actualizar foto de mascota: ${errorText || response.statusText}`);
    }
    
    // Retornar la URL de la nueva foto
    return await response.json();
  } catch (error) {
    // Registrar error específico para facilitar debugging
    console.error(`Error al actualizar foto de mascota con ID ${mascotaId}:`, error);
    throw error;
  }
};

/**
 * Obtiene las mascotas de un usuario de forma simplificada
 * 
 * @param usuarioId - ID del usuario propietario de las mascotas
 * @returns Promesa que resuelve a un array de objetos Mascota
 * @throws Error si la petición falla
 */
export async function obtenerMascotasPorUsuario(usuarioId: number): Promise<Mascota[]> {
  const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas`);
  if (!response.ok) {
    throw new Error('Error al obtener las mascotas del usuario');
  }
  return response.json();
} 