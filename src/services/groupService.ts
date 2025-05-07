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
    const token = localStorage.getItem(config.session.tokenKey);
    
    // Realizar petición GET a la API de grupos
    const response = await fetch(`${config.apiUrl}/grupos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Verificar si la respuesta fue exitosa (código 2xx)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener grupos: ${errorText || response.statusText}`);
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
    const token = localStorage.getItem(config.session.tokenKey);
    
    // Realizar petición GET a la API con el ID específico
    const response = await fetch(`${config.apiUrl}/grupos/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener grupo: ${errorText || response.statusText}`);
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
    const token = localStorage.getItem(config.session.tokenKey);
    
    // Verificar explícitamente que el token exista
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    // Imprimir los datos que se están enviando para depuración
    console.log('Creando grupo con datos:', JSON.stringify(groupData, null, 2));
    console.log('Token de autenticación presente:', !!token);
    
    // Verificar que los campos obligatorios estén presentes
    if (!groupData.nombre || !groupData.descripcion) {
      console.error('Faltan campos obligatorios para crear un grupo');
      throw new Error('El nombre y la descripción son obligatorios para crear un grupo.');
    }
    
    // Extraer el ID del creador para usarlo como parámetro de consulta
    const usuarioId = groupData.creador_id;
    
    // Preparar los datos en formato estándar (sin creador_id)
    const standardData = {
      nombre: groupData.nombre,
      descripcion: groupData.descripcion
    };
    
    // Construir la URL con el parámetro de consulta usuarioId
    const url = usuarioId 
      ? `${config.apiUrl}/grupos?usuarioId=${usuarioId}` 
      : `${config.apiUrl}/grupos`;
    
    console.log('URL de creación de grupo:', url);
    
    // Realizar petición POST con los datos del nuevo grupo
    let response = await fetch(url, {
      method: 'POST',                           // Método HTTP para crear recursos
      headers: {
        'Authorization': `Bearer ${token}`,     // Token de autenticación
        'Content-Type': 'application/json',     // Indicamos que enviamos JSON
      },
      body: JSON.stringify(standardData),       // Convertimos el objeto a string JSON
    });
    
    console.log('Respuesta del servidor:', response.status, response.statusText);
    
    // Verificar si la creación fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Texto de error del servidor:', errorText);
      throw new Error(`Error al crear grupo: ${errorText || response.statusText}`);
    }
    
    // Capturar la respuesta como texto primero para depuración
    const responseText = await response.text();
    console.log('Respuesta del servidor (texto):', responseText);
    
    // Intentar parsear la respuesta como JSON
    let data: Group;
    try {
      // Si la respuesta está vacía, usar un objeto vacío como fallback
      data = responseText ? JSON.parse(responseText) : {} as Group;
      console.log('Grupo creado exitosamente:', data);
    } catch (e) {
      console.error('Error al parsear respuesta JSON:', e);
      throw new Error('Error al procesar la respuesta del servidor al crear grupo');
    }
    
    // Retornar el grupo creado con su ID asignado y otros campos generados
    return data;
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
    const token = localStorage.getItem(config.session.tokenKey);
    
    // Verificar explícitamente que el token exista
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    console.log(`Actualizando grupo con ID ${id}:`, JSON.stringify(groupData, null, 2));
    
    // Asegurarse de que solo enviamos nombre y descripción según la API
    const updateData = {
      nombre: groupData.nombre,
      descripcion: groupData.descripcion
    };
    
    // Realizar petición PUT para actualizar el recurso
    const response = await fetch(`${config.apiUrl}/grupos/${id}`, {
      method: 'PUT',                            // Método HTTP para actualizar recursos
      headers: {
        'Authorization': `Bearer ${token}`,     // Token de autenticación
        'Content-Type': 'application/json',     // Indicamos que enviamos JSON
      },
      body: JSON.stringify(updateData),          // Convertimos los datos parciales a JSON
    });
    
    console.log('Respuesta del servidor:', response.status, response.statusText);
    
    // Verificar si la actualización fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Texto de error del servidor:', errorText);
      throw new Error(`Error al actualizar grupo: ${errorText || response.statusText}`);
    }
    
    // Capturar la respuesta como texto primero para depuración
    const responseText = await response.text();
    console.log('Respuesta del servidor (texto):', responseText);
    
    // Intentar parsear la respuesta como JSON
    let data: Group;
    try {
      // Si la respuesta está vacía, usar un objeto vacío como fallback
      data = responseText ? JSON.parse(responseText) : {} as Group;
      console.log('Grupo actualizado exitosamente:', data);
    } catch (e) {
      console.error('Error al parsear respuesta JSON:', e);
      throw new Error('Error al procesar la respuesta del servidor al actualizar grupo');
    }
    
    // Retornar el grupo con los datos actualizados
    return data;
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
    const token = localStorage.getItem(config.session.tokenKey);
    
    // Realizar petición DELETE para eliminar el recurso
    const response = await fetch(`${config.apiUrl}/grupos/${id}`, {
      method: 'DELETE',                         // Método HTTP para eliminar recursos
      headers: {
        'Authorization': `Bearer ${token}`      // Token de autenticación
      }
    });
    
    // Verificar si la eliminación fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al eliminar grupo: ${errorText || response.statusText}`);
    }
    // No retornamos datos ya que el recurso ha sido eliminado
  } catch (error) {
    // Registrar error específico con el ID para facilitar debugging
    console.error(`Error al eliminar grupo con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Une a un usuario a un grupo específico
 * 
 * @param groupId - ID del grupo al que el usuario quiere unirse
 * @param userId - ID del usuario que se une al grupo
 * @returns Promesa que se resuelve cuando la operación es exitosa
 * @throws Error si la operación falla
 */
export const joinGroup = async (groupId: number, userId: number): Promise<void> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    // Verificar explícitamente que el token exista
    if (!token) {
      console.error('No se encontró token de autenticación en localStorage');
      throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
    }
    
    console.log(`Usuario ${userId} intentando unirse al grupo ${groupId}`);
    
    // Según la documentación, la ruta es /usuario-grupo
    const response = await fetch(`${config.apiUrl}/usuario-grupo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        usuarioId: userId,
        grupoId: groupId,
        rol: 'Miembro' // Rol predeterminado para nuevos miembros
      })
    });
    
    console.log('Respuesta del servidor:', response.status, response.statusText);
    
    // Verificar si la operación fue exitosa
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Texto de error del servidor:', errorText);
      throw new Error(`Error al unirse al grupo: ${errorText || response.statusText}`);
    }
    
    console.log(`Usuario ${userId} se unió exitosamente al grupo ${groupId}`);
  } catch (error) {
    // Registrar error específico para debugging
    console.error(`Error al unirse al grupo con ID ${groupId}:`, error);
    throw error;
  }
};

/**
 * Verifica si el token de autenticación actual es válido
 * 
 * @returns Promesa que resuelve a un booleano indicando si el token es válido
 */
export const verifyAuthToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem(config.session.tokenKey);
    
    if (!token) {
      console.log('No hay token para verificar');
      return false;
    }
    
    // Intentamos obtener los grupos como una operación simple para verificar el token
    const response = await fetch(`${config.apiUrl}/grupos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      console.log('Token inválido o expirado');
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return false;
  }
};