/**
 * Utility functions for home components
 */

/**
 * Formats relative time from a date string (e.g. "hace 5 minutos")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
};

/**
 * Gets user avatar image URL with fallback
 */
export const getUserImage = (userImagesCache: Record<number, string>, userId: number): string => {
  return userImagesCache[userId] || '/default-avatar.svg';
}; 