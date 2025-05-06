import React from 'react';
import { getUserImage } from './HomeUtils';
import { UserImagesCache } from './types';

interface UserAvatarProps {
  userId: number | string;
  userImagesCache: UserImagesCache;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente reutilizable para mostrar el avatar de un usuario
 */
const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userId, 
  userImagesCache, 
  size = 'md', 
  className = ''
}) => {
  // Determinar el tamaño en base al prop size
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  const sizeClass = sizeClasses[size];
  
  // Obtener la URL de la imagen usando la utilidad existente
  const imageSrc = getUserImage(
    userImagesCache, 
    typeof userId === 'number' ? userId : parseInt(userId.toString()) || 1
  );
  
  return (
    <div className={`${sizeClass} rounded-full bg-gray-300 overflow-hidden flex-shrink-0 ${className}`}>
      <img 
        src={imageSrc} 
        alt="Avatar" 
        className="h-full w-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/default-avatar.svg';
        }}
      />
    </div>
  );
};

export default UserAvatar; 