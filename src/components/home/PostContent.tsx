import React from 'react';
import { config } from '../../config';

interface PostContentProps {
  contenido: string;
  imagen?: string;
  postId: number;
}

/**
 * Componente para mostrar el contenido principal de un post
 */
const PostContent: React.FC<PostContentProps> = ({ contenido, imagen, postId }) => {
  // Construir la URL completa de la imagen si existe
  const imageUrl = imagen ? (imagen.startsWith('http') ? imagen : `${config.apiUrl}/uploads/${imagen}`) : null;

  return (
    <>
      {/* Texto del post */}
      <div className="px-4 pb-3">
        <p className="text-[#2a2827] text-sm mb-4">{contenido}</p>
      </div>
      
      {/* Imagen del post si existe */}
      {imageUrl && (
        <div className="border-t border-b border-gray-100">
          <img 
            src={imageUrl} 
            alt="Contenido de la publicación" 
            className="w-full h-auto"
            onError={(e) => {
              console.error(`Error al cargar imagen del post ${postId}:`, imageUrl);
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