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
      <button className="text-[#575350] hover:text-[#2a2827] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#f8ffe5]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      </button>
    </div>
  );
};

export default PostHeader; 