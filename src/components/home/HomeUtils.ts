/**
 * Utility functions for home components
 */

import { config } from '../../config';

/**
 * Formats relative time from a date string (e.g. "hace 5 minutos")
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Fecha desconocida';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Gets user avatar image URL with fallback
 * 
 * Esta función mejorada intenta obtener la imagen del usuario del caché,
 * pero también maneja casos donde el ID puede ser una cadena o un número,
 * proporcionando una imagen predeterminada como respaldo.
 */
export const getUserImage = (userImagesCache: Record<number, string>, userId?: number | string): string => {
  // Si no hay ID de usuario, retornar imagen por defecto
  if (userId === undefined || userId === null) {
    console.log('getUserImage: ID de usuario indefinido o nulo, usando imagen por defecto');
    return '/default-avatar.svg';
  }
  
  // Convertir userId a número si es una cadena
  const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  
  // Si no podemos convertir a número válido, usar imagen por defecto
  if (isNaN(numericUserId)) {
    console.log(`getUserImage: No se pudo convertir ID "${userId}" a número, usando imagen por defecto`);
    return '/default-avatar.svg';
  }
  
  // Si no hay caché de imágenes, usar imagen por defecto
  if (!userImagesCache) {
    console.log('getUserImage: No hay caché de imágenes disponible, usando imagen por defecto');
    return '/default-avatar.svg';
  }
  
  // Intentar obtener la imagen del caché
  const cachedImage = userImagesCache[numericUserId];
  
  // Registrar para depuración
  console.log(`getUserImage: Buscando imagen para usuario ${numericUserId} - Resultado: ${cachedImage || 'no encontrada'}`);
  
  // Si hay una URL de imagen cacheada
  if (cachedImage) {
    // Si ya es una URL completa (http o https), la devolvemos tal cual
    if (cachedImage.startsWith('http')) {
      return cachedImage;
    }
    // Si es una ruta relativa que no empieza con /, construir la URL completa
    if (!cachedImage.startsWith('/')) {
      return `${config.apiUrl}/uploads/${cachedImage}`;
    }
    // Si es una ruta que empieza con /, construir la URL completa
    return `${config.apiUrl}${cachedImage}`;
  }
  
  // Retornamos la imagen predeterminada si no hay una válida en el caché
  return '/default-avatar.svg';
}; 