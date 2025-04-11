/**
 * Servicio de Perfiles para Patitas Conectadas
 * 
 * Este módulo proporciona funciones para interactuar con la API de perfiles de usuario,
 * permitiendo realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
 * sobre los perfiles en la plataforma.
 * 
 * Los perfiles contienen información personal de los usuarios, sus intereses,
 * fechas importantes y otra información que se muestra en su página de perfil.
 * 
 * Este servicio incluye soporte para headers personalizados, facilitando la autenticación
 * y otras opciones de configuración para las peticiones.
 */
import { config } from '../config';

/**
 * Interfaz para el modelo de Perfil
 * Define la estructura de datos para los perfiles de usuario en la aplicación
 * Basado en la estructura PerfilModel de la API:
 * {
 *   "id": Long,                // Identificador único del perfil (generado automáticamente)
 *   "usuario_id": Long,        // ID del usuario al que pertenece el perfil
 *   "descripcion": String,     // Descripción del perfil
 *   "fecha_nacimiento": Date,  // Fecha de nacimiento (formato SQL Date)
 *   "img": String              // URL o ruta de la imagen del perfil
 * }
 */
export interface Profile {
  id?: number;                // Identificador único del perfil (opcional para creación)
  usuario_id: number;         // ID del usuario al que pertenece el perfil (campo obligatorio)
  descripcion?: string;       // Descripción o biografía del usuario
  fecha_nacimiento?: string;  // Fecha de nacimiento en formato ISO
  img?: string;               // URL de la imagen de perfil
  fecha_creacion?: string;    // Fecha de creación del perfil (generada por el servidor)
  intereses?: string[];       // Lista de intereses o tags del usuario
}

/**
 * Interfaz para headers personalizados en peticiones HTTP
 * Permite especificar headers adicionales como autenticación, caché, etc.
 */
export interface CustomHeaders {
  [key: string]: string;      // Índice de tipo string que mapea a valores string
}

/**
 * Obtiene todos los perfiles desde el backend
 * Útil para búsqueda y administración
 * 
 * @param headers - Headers opcionales para la petición (ej: token de autenticación)
 * @returns Promesa que resuelve a un array de objetos Profile
 * @throws Error si la petición falla
 */
export const fetchProfiles = async (headers?: CustomHeaders): Promise<Profile[]> => {
  try {
    // Realizar petición GET a la API de perfiles con headers opcionales
    const response = await fetch(`${config.apiUrl}/perfiles`, {
      headers: headers  // Incluir headers si fueron proporcionados
    });
    
    // Verificar si la respuesta fue exitosa (código 2xx)
    if (!response.ok) {
      throw new Error(`Error al obtener perfiles: ${response.statusText}`);
    }
    
    // Parsear y retornar los datos JSON como array de perfiles
    return await response.json();
  } catch (error) {
    // Registrar error para debugging
    console.error('Error en servicio de perfiles:', error);
    throw error; // Relanzar para manejo en componentes
  }
};

/**
 * Obtiene un perfil específico por su ID
 * 
 * @param id - ID numérico del perfil a obtener
 * @param headers - Headers opcionales para la petición
 * @returns Promesa que resuelve a un objeto Profile con los detalles del perfil
 * @throws Error si el perfil no existe o la petición falla
 */
export const fetchProfileById = async (id: number, headers?: CustomHeaders): Promise<Profile> => {
  try {
    // Realizar petición GET a la API con el ID específico
    const response = await fetch(`${config.apiUrl}/perfiles/${id}`, {
      headers: headers  // Incluir headers si fueron proporcionados
    });
    
    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      throw new Error(`Error al obtener perfil: ${response.statusText}`);
    }
    
    // Parsear y retornar los datos JSON como objeto perfil
    return await response.json();
  } catch (error) {
    // Registrar error específico con el ID para facilitar debugging
    console.error(`Error al obtener perfil con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo perfil en el sistema
 * 
 * @param profileData - Objeto con los datos del perfil a crear
 * @param headers - Headers opcionales para la petición
 * @returns Promesa que resuelve al objeto Profile creado (con ID asignado)
 * @throws Error si la creación falla
 */
export const createProfile = async (profileData: Profile, headers?: CustomHeaders): Promise<Profile> => {
  try {
    // Headers por defecto para la petición
    const defaultHeaders = {
      'Content-Type': 'application/json',  // Indicamos que enviamos JSON
    };

    // Combinar los headers por defecto con los proporcionados
    const mergedHeaders = { ...defaultHeaders, ...headers };
    
    // Realizar petición POST con los datos del nuevo perfil
    const response = await fetch(`${config.apiUrl}/perfiles`, {
      method: 'POST',                     // Método HTTP para crear recursos
      headers: mergedHeaders,             // Usar los headers combinados
      body: JSON.stringify(profileData),  // Convertir el objeto a string JSON
    });
    
    // Verificar si la creación fue exitosa
    if (!response.ok) {
      throw new Error(`Error al crear perfil: ${response.statusText}`);
    }
    
    // Retornar el perfil creado con su ID asignado y otros campos generados
    return await response.json();
  } catch (error) {
    // Registrar error para debugging
    console.error('Error al crear perfil:', error);
    throw error;
  }
};

/**
 * Actualiza un perfil existente con nuevos datos
 * Nota: Según la API, usa método POST en lugar de PUT para actualizaciones
 * 
 * @param id - ID del perfil a actualizar
 * @param profileData - Datos parciales o completos a actualizar
 * @param headers - Headers opcionales para la petición
 * @returns Promesa que resuelve al objeto Profile actualizado
 * @throws Error si la actualización falla o el perfil no existe
 */
export const updateProfile = async (id: number, profileData: Partial<Profile>, headers?: CustomHeaders): Promise<Profile> => {
  try {
    // Headers por defecto para la petición
    const defaultHeaders = {
      'Content-Type': 'application/json',  // Indicamos que enviamos JSON
    };

    // Combinar los headers por defecto con los proporcionados
    const mergedHeaders = { ...defaultHeaders, ...headers };
    
    // Realizar petición POST para actualizar el recurso (según la API usa POST, no PUT)
    // Partial<Profile> permite enviar solo los campos que queremos actualizar
    const response = await fetch(`${config.apiUrl}/perfiles/${id}`, {
      method: 'POST',                      // Método HTTP especificado por la API (POST en lugar de PUT)
      headers: mergedHeaders,              // Usar los headers combinados
      body: JSON.stringify(profileData),   // Convertir los datos parciales a JSON
    });
    
    // Verificar si la actualización fue exitosa
    if (!response.ok) {
      throw new Error(`Error al actualizar perfil: ${response.statusText}`);
    }
    
    // Retornar el perfil con los datos actualizados
    return await response.json();
  } catch (error) {
    // Registrar error específico con el ID para facilitar debugging
    console.error(`Error al actualizar perfil con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un perfil del sistema
 * 
 * @param id - ID del perfil a eliminar
 * @param headers - Headers opcionales para la petición
 * @returns Promesa vacía que se resuelve cuando la eliminación es exitosa
 * @throws Error si la eliminación falla
 */
export const deleteProfile = async (id: number, headers?: CustomHeaders): Promise<void> => {
  try {
    // Realizar petición DELETE para eliminar el recurso
    const response = await fetch(`${config.apiUrl}/perfiles/${id}`, {
      method: 'DELETE',        // Método HTTP para eliminar recursos
      headers: headers         // Incluir headers si fueron proporcionados
    });
    
    // Verificar si la eliminación fue exitosa
    if (!response.ok) {
      throw new Error(`Error al eliminar perfil: ${response.statusText}`);
    }
    // No retornamos datos ya que el recurso ha sido eliminado
  } catch (error) {
    // Registrar error específico con el ID para facilitar debugging
    console.error(`Error al eliminar perfil con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene el perfil del usuario autenticado actualmente
 * Si el perfil no existe, lo crea automáticamente
 * 
 * @param userId - ID del usuario cuyo perfil se quiere obtener
 * @param headers - Headers opcionales para la petición (generalmente incluye token de autenticación)
 * @returns Promesa que resuelve al perfil del usuario actual
 * @throws Error si no se puede obtener ni crear el perfil
 */
export const fetchCurrentUserProfile = async (userId: number, headers?: CustomHeaders): Promise<Profile> => {
  try {
    // Logging para debugging
    console.log(`Realizando petición a: ${config.apiUrl}/perfiles/usuario/${userId}`);
    console.log('Headers:', headers);
    
    // Intentar obtener el perfil del usuario por su ID
    // Nota: Esta ruta específica para obtener perfil por usuario_id no está en la documentación API
    // pero intentamos usarla. Si falla, buscaremos en todos los perfiles.
    const response = await fetch(`${config.apiUrl}/perfiles/usuario/${userId}`, {
      headers: headers  // Incluir headers si fueron proporcionados (generalmente token)
    });
    
    console.log('Respuesta status:', response.status);
    
    // Verificar la respuesta
    if (!response.ok) {
      if (response.status === 404) {
        // Si obtenemos un 404, puede que la ruta no exista o que el perfil no exista
        console.log('Perfil o ruta no encontrada. Intentando obtener todos los perfiles para filtrar');
        
        // Alternativa: obtener todos los perfiles y filtrar
        const perfiles = await fetchProfiles(headers);
        const userProfile = perfiles.find(p => p.usuario_id === userId);
        
        if (userProfile) {
          console.log('Perfil encontrado entre todos los perfiles:', userProfile);
          return userProfile;
        }
        
        // Si no encontramos el perfil, creamos uno nuevo
        console.log('Perfil no encontrado, se creará uno nuevo');
        
        // Preparar datos mínimos para un nuevo perfil
        const nuevoPerfilData: Profile = {
          usuario_id: userId,        // ID del usuario al que pertenecerá
          descripcion: '',           // Descripción vacía inicial
          fecha_nacimiento: '',      // Sin fecha de nacimiento inicial
          intereses: [],             // Sin intereses iniciales
        };
        
        // Crear el nuevo perfil usando la función de creación
        return await createProfile(nuevoPerfilData, headers);
      }
      
      // Si hay otro tipo de error, obtener el texto de error y lanzar excepción
      const errorText = await response.text();
      throw new Error(`Error al obtener perfil de usuario (${response.status}): ${errorText || response.statusText}`);
    }
    
    // Si todo va bien, parsear y retornar el perfil encontrado
    const data = await response.json();
    console.log('Datos recibidos:', data);
    return data;
  } catch (error) {
    // Registrar error específico para debugging
    console.error(`Error al obtener perfil del usuario ${userId}:`, error);
    throw error;
  }
};