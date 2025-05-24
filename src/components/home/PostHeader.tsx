import React from 'react';
import { formatRelativeTime } from './HomeUtils';
import UserAvatar from './UserAvatar';
import { UserImagesCache } from './types';

interface PostHeaderProps {
  creadorId: number | undefined;
  creadorNombre: string;
  creadorApellido: string;
  fecha: string;
  userImagesCache: UserImagesCache;
  postId: number;
}

/**
 * Componente para mostrar la cabecera de un post (autor, fecha, opciones)
 */
const PostHeader: React.FC<PostHeaderProps> = ({
  creadorId,
  creadorNombre,
  creadorApellido,
  fecha,
  userImagesCache,
  postId
}) => {
  return (
    <div className="p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <UserAvatar 
          userId={creadorId || 1} 
          userImagesCache={userImagesCache} 
          size="lg" 
        />
        <div>
          <p className="font-medium text-sm text-[#2a2827]">
            {creadorNombre} {creadorApellido}
          </p>
          <p className="text-[#575350] text-xs">{formatRelativeTime(fecha)}</p>
        </div>
      </div>
    </div>
  );
};

export default PostHeader; 