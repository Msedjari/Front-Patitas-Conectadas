import React from 'react';
import { Comment, UserImagesCache } from './types';
import { formatRelativeTime, getUserImage } from './HomeUtils';

interface CommentListProps {
  comments: Comment[];
  userImagesCache: UserImagesCache;
}

/**
 * Componente para mostrar la lista de comentarios de una publicación
 */
const CommentList: React.FC<CommentListProps> = ({ comments, userImagesCache }) => {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-100 pt-2 px-4">
      <h4 className="text-sm font-medium text-[#3d7b6f] mb-2">Comentarios ({comments.length})</h4>
      
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment.id} className="flex space-x-2">
            <div className="h-7 w-7 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
              <img 
                src={getUserImage(userImagesCache, comment.creadorId)} 
                alt={comment.nombreCreador}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.svg';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="bg-[#f8ffe5] rounded-xl p-2 text-sm">
                <p className="font-medium text-xs text-[#2a2827]">
                  {comment.nombreCreador} {comment.apellidoCreador || ''}
                </p>
                <p className="text-[#575350]">{comment.contenido}</p>
              </div>
              {comment.img && (
                <div className="mt-1 max-w-[200px]">
                  <img 
                    src={comment.img} 
                    alt="Imagen de comentario" 
                    className="rounded-lg w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/sample-post-image.svg';
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-[#575350] mt-1 ml-2">{formatRelativeTime(comment.fecha)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentList; 