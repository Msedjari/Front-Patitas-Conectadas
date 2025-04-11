/**
 * Configuración centralizada de la aplicación Patitas Conectadas
 * 
 * Este archivo contiene todas las configuraciones de la aplicación,
 * centralizada en un único lugar para facilitar su mantenimiento y
 * permitir cambios globales desde un solo punto.
 * 
 * Incluye:
 * - Configuración de la API y endpoints
 * - Parámetros de la aplicación
 * - Configuración de paginación
 * - Límites para subida de archivos
 * - Claves de almacenamiento para sesión
 */

// Determinar si la aplicación está en modo desarrollo o producción
// Usa la variable de entorno DEV proporcionada por Vite
const isDevelopment = import.meta.env.DEV;

/**
 * Objeto de configuración principal exportado para uso en toda la aplicación
 */
export const config = {
  /**
   * URL base para todas las peticiones a la API
   * Usa la variable de entorno REACT_APP_API_URL si está definida,
   * o usa la URL de desarrollo local, o la ruta relativa en producción
   */
  apiUrl: import.meta.env.REACT_APP_API_URL || (isDevelopment ? 'http://192.168.251.60:4000' : '/api'),
  
  /**
   * Información básica de la aplicación
   * Útil para mostrar en interfaz y para debugging
   */
  app: {
    name: 'Patitas Conectadas',     // Nombre de la aplicación
    version: '1.0.0',               // Versión actual
  },
  
  /**
   * Configuración para paginación de contenido
   * Define cuántos elementos mostrar por página para distintos tipos de contenido
   */
  pagination: {
    postsPerPage: 10,               // Publicaciones por página
    usersPerPage: 20,               // Usuarios por página en listados
  },
  
  /**
   * Configuración para subida de archivos
   * Define restricciones de tamaño y tipos de archivo permitidos
   */
  upload: {
    maxFileSize: 5 * 1024 * 1024,   // 5MB en bytes como tamaño máximo
    allowedImageTypes: [            // Tipos MIME permitidos para imágenes
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp'
    ],
  },
  
  /**
   * Configuración para manejo de sesiones
   * Define claves para almacenamiento en localStorage
   */
  session: {
    tokenKey: 'auth_token',         // Clave para almacenar el token JWT
    userKey: 'user_data',           // Clave para almacenar datos del usuario
  }
};