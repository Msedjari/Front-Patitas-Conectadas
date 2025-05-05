import React from 'react';
import { Post, UserImagesCache } from './types';
import { formatRelativeTime, getUserImage } from './HomeUtils';
import CommentForm from './CommentForm';

interface PostItemProps {
  post: Post;
  userImagesCache: UserImagesCache;
  userId: number | string;
  onCommentSubmit?: (postId: number, text: string) => void;
}

/**
 * Componente para mostrar una publicación individual
 */
const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  userImagesCache, 
  userId,
  onCommentSubmit 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Cabecera del post */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
            <img 
              src={getUserImage(userImagesCache, post.creador.id)} 
              alt={post.creador.nombre || "Usuario"} 
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-avatar.svg';
              }}
            />
          </div>
          <div>
            <p className="font-medium text-sm text-[#2a2827]">
              {post.creador.nombre} {post.creador.apellido || ""}
            </p>
            <p className="text-[#575350] text-xs">{formatRelativeTime(post.fecha || post.createdAt || '')}</p>
          </div>
        </div>
        <button className="text-[#575350] hover:text-[#2a2827] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[#f8ffe5]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>
      
      {/* Contenido del post */}
      <div className="px-4 pb-3">
        <p className="text-[#2a2827] text-sm mb-4">{post.contenido}</p>
      </div>
      
      {/* Imagen del post si existe */}
      {post.img && (
        <div className="border-t border-b border-gray-100">
          <img 
            src={post.img} 
            alt="Contenido de la publicación" 
            className="w-full h-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/sample-post-image.svg';
            }}
          />
        </div>
      )}
      
      {/* Formulario de comentarios */}
      <CommentForm 
        postId={post.id} 
        userId={userId} 
        userImagesCache={userImagesCache}
        onCommentSubmit={onCommentSubmit}
      />
    </div>
  );
};

export default PostItem; 