/**
 * Servicio de Grupos para Patitas Conectadas
 * 
 * Este módulo proporciona funciones para interactuar con la API de grupos,
 * permitiendo realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * sobre los grupos en la plataforma.
 * 
 * Los grupos son espacios colaborativos donde usuarios con intereses similares
 * pueden compartir información, publicaciones y recursos relacionados con mascotas.
 */
import { config } from '../config';

/**
 * Interfaz para el modelo de Grupo
 * Define la estructura de datos para los grupos en la aplicación
 */
export interface Group {
  id?: number;              // Identificador único del grupo (opcional para creación)
  nombre: string;           // Nombre del grupo - obligatorio
  descripcion: string;      // Descripción del propósito del grupo - obligatorio
  creador_id?: number;      // ID del usuario que creó el grupo
  fecha_creacion?: string;  // Fecha en que se creó el grupo (formato ISO)
  img?: string;             // URL de la imagen o logo del grupo
  num_miembros?: number;    // Número de miembros actuales en el grupo
}

/**
 * Obtiene todos los grupos desde el backend
 * 
 * @returns Promesa que resuelve a un array de objetos Group
 * @throws Error si la petición falla
 */
export const fetchGroups = async (): Promise<Group[]> => {
  try {
    // Realizar petición GET a la API de grupos
    const response = await fetch(`${config.apiUrl}/grupos`);
    
    // Verificar si la respuesta fue exitosa (código 2xx)
    if (!response.ok) {
      throw new Error(`Error al obtener grupos: ${response.statusText}`);
    }
    
    // Parsear y retornar los datos JSON como array de grupos
    return await response.json();
  } catch (error) {
    // Registrar error para debugging y relanzarlo
    console.error('Error en servicio de grupos:', error);
    throw error; // Relanzar para manejo en componentes
  }
};

/**
 * Obtiene un grupo específico por su ID
 * 
 * @param id - ID numérico del grupo a obtener
 * @returns Promesa que resuelve a un objeto Group con los detalles del grupo
 * @throws Error si el grupo no existe o la petición falla
 */
export const fetchGroupById = async (id: number): Promise<Group> => {
  try {
    // Realizar petición GET a la API con el ID específico
    const response = await fetch(`${config.apiUrl}/grupos/${id}`);
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error al obtener grupo: ${response.statusText}`);
    }
    
    // Parsear y retornar los datos JSON como objeto grupo
    return await response.json();
  } catch (error) {
    // Registrar error específico con el ID para facilitar debugging
    console.error(`Error al obtener grupo con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo grupo en el sistema
 * 
 * @param groupData - Objeto con los datos del grupo a crear
 * @returns Promesa que resuelve al objeto Group creado (con ID asignado)
 * @throws Error si la creación falla
 */
export const createGroup = async (groupData: Group): Promise<Group> => {
  try {
    // Realizar petición POST con los datos del nuevo grupo
    const response = await fetch(`${config.apiUrl}/grupos`, {
      method: 'POST',                           // Método HTTP para crear recursos
      headers: {
        'Content-Type': 'application/json',     // Indicamos que enviamos JSON
      },
      body: JSON.stringify(groupData),          // Convertimos el objeto a string JSON
    });
    
    // Verificar si la creación fue exitosa
    if (!response.ok) {
      throw new Error(`Error al crear grupo: ${response.statusText}`);
    }
    
    // Retornar el grupo creado con su ID asignado y otros campos generados
    return await response.json();
  } catch (error) {
    // Registrar error para debugging
    console.error('Error al crear grupo:', error);
    throw error;
  }
};

/**
 * Actualiza un grupo existente con nuevos datos
 * 
 * @param id - ID del grupo a actualizar
 * @param groupData - Datos parciales o completos a actualizar
 * @returns Promesa que resuelve al objeto Group actualizado
 * @throws Error si la actualización falla o el grupo no existe
 */
export const updateGroup = async (id: number, groupData: Partial<Group>): Promise<Group> => {
  try {
    // Realizar petición PUT para actualizar el recurso
    // Partial<Group> permite enviar solo los campos que queremos actualizar
    const response = await fetch(`${config.apiUrl}/grupos/${id}`, {
      method: 'PUT',                            // Método HTTP para actualizar recursos
      headers: {
        'Content-Type': 'application/json',     // Indicamos que enviamos JSON
      },
      body: JSON.stringify(groupData),          // Convertimos los datos parciales a JSON
    });
    
    // Verificar si la actualización fue exitosa
    if (!response.ok) {
      throw new Error(`Error al actualizar grupo: ${response.statusText}`);
    }
    
    // Retornar el grupo con los datos actualizados
    return await response.json();
  } catch (error) {
    // Registrar error específico con el ID para facilitar debugging
    console.error(`Error al actualizar grupo con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un grupo del sistema
 * 
 * @param id - ID del grupo a eliminar
 * @returns Promesa vacía que se resuelve cuando la eliminación es exitosa
 * @throws Error si la eliminación falla
 */
export const deleteGroup = async (id: number): Promise<void> => {
  try {
    // Realizar petición DELETE para eliminar el recurso
    const response = await fetch(`${config.apiUrl}/grupos/${id}`, {
      method: 'DELETE',                         // Método HTTP para eliminar recursos
    });
    
    // Verificar si la eliminación fue exitosa
    if (!response.ok) {
      throw new Error(`Error al eliminar grupo: ${response.statusText}`);
    }
    // No retornamos datos ya que el recurso ha sido eliminado
  } catch (error) {
    // Registrar error específico con el ID para facilitar debugging
    console.error(`Error al eliminar grupo con ID ${id}:`, error);
    throw error;
  }
};