import { config } from '../config';

/**
 * Interfaz para el modelo de Mascota
 */
export interface Mascota {
  id?: number;         // ID de la mascota (opcional para nuevas mascotas)
  usuario_id: number;  // ID del usuario dueño de la mascota
  nombre: string;      // Nombre de la mascota
  genero: string;      // Género de la mascota (Macho/Hembra)
  raza: string;        // Raza de la mascota
}

/**
 * Obtiene todas las mascotas de un usuario
 * @param usuarioId - ID del usuario
 */
export const getMascotasByUsuario = async (usuarioId: number): Promise<Mascota[]> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    throw error;
  }
};

/**
 * Crea una nueva mascota para un usuario
 * @param usuarioId - ID del usuario
 * @param mascotaData - Datos de la mascota a crear
 */
export const crearMascota = async (usuarioId: number, mascotaData: Omit<Mascota, 'id' | 'usuario_id'>): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...mascotaData,
        usuario_id: usuarioId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al crear mascota:', error);
    throw error;
  }
};

/**
 * Actualiza una mascota existente
 * @param usuarioId - ID del usuario
 * @param mascotaId - ID de la mascota a actualizar
 * @param mascotaData - Datos actualizados de la mascota
 */
export const actualizarMascota = async (
  usuarioId: number, 
  mascotaId: number, 
  mascotaData: Partial<Mascota>
): Promise<Mascota> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas/${mascotaId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mascotaData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    throw error;
  }
};

/**
 * Elimina una mascota
 * @param usuarioId - ID del usuario
 * @param mascotaId - ID de la mascota a eliminar
 */
export const eliminarMascota = async (usuarioId: number, mascotaId: number): Promise<boolean> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    const response = await fetch(`${config.apiUrl}/usuarios/${usuarioId}/mascotas/${mascotaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    throw error;
  }
}; 