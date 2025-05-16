/**
 * Servicio de Mascotas para Patitas Conectadas
 *
 * Este módulo proporciona funciones para interactuar con la API de mascotas,
 * permitiendo operaciones como obtener detalles de mascotas, crear, actualizar
 * y eliminar mascotas, así como gestionar sus fotos.
 */
import { config } from '../config';

/**
 * Interfaz para el modelo de Mascota
 */
export interface Mascota {
  id?: number;
  nombre: string;
  especie: string;
  raza?: string;
  edad?: number;
  genero?: string;
  descripcion?: string;
  foto?: string;
  usuario_id: number;
  fecha_registro?: string;
}

/**
 * Obtiene las mascotas de un usuario específico
 * 
 * @param userId - ID del usuario propietario de las mascotas
 * @returns Promesa que resuelve a un array de objetos Mascota
 * @throws Error si la petición falla
 */
export const fetchMascotasByUserId = async (userId: number): Promise<Mascota[]> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Usar la ruta correcta según la documentación: GET /usuarios/{usuarioId}/mascotas
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}/mascotas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener mascotas: ${errorText || response.statusText}`);
    }
    
    // Parsear y retornar los datos JSON como array de mascotas
    return await response.json();
  } catch (error) {
    // Registrar error específico para facilitar debugging
    console.error(`Error al obtener mascotas del usuario con ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Obtiene una mascota específica por su ID
 * 
 * @param mascotaId - ID de la mascota a obtener
 * @returns Promesa que resuelve a un objeto Mascota con los detalles
 * @throws Error si la mascota no existe o la petición falla
 */
export const fetchMascotaById = async (mascotaId: number, userId: number): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Usar la ruta correcta según la documentación: GET /usuarios/{usuarioId}/mascotas/{mascotaId}
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}/mascotas/${mascotaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener mascota: ${errorText || response.statusText}`);
    }
    
    // Parsear y retornar los datos JSON como objeto mascota
    return await response.json();
  } catch (error) {
    // Registrar error específico para facilitar debugging
    console.error(`Error al obtener mascota con ID ${mascotaId}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva mascota en el sistema
 * 
 * @param mascotaData - Datos de la mascota a crear
 * @returns Promesa que resuelve al objeto Mascota creado
 * @throws Error si la creación falla
 */
export const createMascota = async (mascotaData: Omit<Mascota, 'id'>): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const userId = mascotaData.usuario_id;
    
    // Usar la ruta correcta según la documentación: POST /usuarios/{usuarioId}/mascotas
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}/mascotas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mascotaData)
    });
    
    // Verificar si la creación fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear mascota: ${errorText || response.statusText}`);
    }
    
    // Retornar la mascota creada
    return await response.json();
  } catch (error) {
    // Registrar error específico para facilitar debugging
    console.error('Error al crear mascota:', error);
    throw error;
  }
};

/**
 * Actualiza una mascota existente
 * 
 * @param mascotaId - ID de la mascota a actualizar
 * @param mascotaData - Datos parciales o completos a actualizar
 * @returns Promesa que resuelve al objeto Mascota actualizado
 * @throws Error si la actualización falla o la mascota no existe
 */
export const updateMascota = async (mascotaId: number, mascotaData: Partial<Mascota>): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    const userId = mascotaData.usuario_id;
    
    if (!userId) {
      throw new Error('Se requiere el ID del usuario para actualizar la mascota');
    }
    
    // Usar la ruta correcta según la documentación: PUT /usuarios/{usuarioId}/mascotas/{mascotaId}
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}/mascotas/${mascotaId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mascotaData)
    });
    
    // Verificar si la actualización fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al actualizar mascota: ${errorText || response.statusText}`);
    }
    
    // Retornar la mascota actualizada
    return await response.json();
  } catch (error) {
    // Registrar error específico para facilitar debugging
    console.error(`Error al actualizar mascota con ID ${mascotaId}:`, error);
    throw error;
  }
};

/**
 * Elimina una mascota del sistema
 * 
 * @param mascotaId - ID de la mascota a eliminar
 * @param userId - ID del usuario propietario de la mascota
 * @returns Promesa vacía que se resuelve cuando la eliminación es exitosa
 * @throws Error si la eliminación falla
 */
export const deleteMascota = async (mascotaId: number, userId?: number): Promise<void> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Si no se proporciona el userId, intentar obtenerlo del localStorage
    if (!userId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      userId = user.id;
      
      if (!userId) {
        throw new Error('No se pudo determinar el ID del usuario para eliminar la mascota');
      }
    }
    
    // Usar la ruta correcta según la documentación: DELETE /usuarios/{usuarioId}/mascotas/{mascotaId}
    const response = await fetch(`${config.apiUrl}/usuarios/${userId}/mascotas/${mascotaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Verificar si la eliminación fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al eliminar mascota: ${errorText || response.statusText}`);
    }
  } catch (error) {
    // Registrar error específico para facilitar debugging
    console.error(`Error al eliminar mascota con ID ${mascotaId}:`, error);
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