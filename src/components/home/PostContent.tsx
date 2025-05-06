import React from 'react';

interface PostContentProps {
  contenido: string;
  imagen?: string;
  postId: number;
}

/**
 * Componente para mostrar el contenido principal de un post
 */
const PostContent: React.FC<PostContentProps> = ({ contenido, imagen, postId }) => {
  return (
    <>
      {/* Texto del post */}
      <div className="px-4 pb-3">
        <p className="text-[#2a2827] text-sm mb-4">{contenido}</p>
      </div>
      
      {/* Imagen del post si existe */}
      {imagen && (
        <div className="border-t border-b border-gray-100">
          <img 
            src={imagen} 
            alt="Contenido de la publicación" 
            className="w-full h-auto"
            onError={(e) => {
              console.error(`Error al cargar imagen del post ${postId}`);
              const target = e.target as HTMLImageElement;
              target.src = '/sample-post-image.svg';
            }}
          />
        </div>
      )}
    </>
  );
};

export default PostContent; 