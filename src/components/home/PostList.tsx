import React, { useEffect } from 'react';
import { Post, UserImagesCache, CommentData } from './types';
import PostItem from './PostItem';

interface PostListProps {
  posts: Post[];
  userImagesCache: UserImagesCache;
  userId: number | string;
  loading: boolean;
  onLoadMore?: () => void;
  onCommentSubmit?: (commentData: CommentData) => void;
  onDeletePost?: (postId: number) => void;
}

/**
 * Componente para mostrar la lista de publicaciones
 */
const PostList: React.FC<PostListProps> = ({ 
  posts, 
  userImagesCache, 
  userId,
  loading,
  onLoadMore,
  onCommentSubmit,
  onDeletePost
}) => {
  // Efecto para depurar información de posts y caché de imágenes
  useEffect(() => {
    console.log('PostList - Posts recibidos:', posts.length);
    
    if (posts.length > 0) {
      // Inspeccionar los primeros 3 posts para depuración
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`PostList - Inspección de post #${index + 1}:`, {
          id: post.id,
          contenido: post.contenido?.substring(0, 30) + (post.contenido?.length > 30 ? '...' : ''),
          creador: post.creador
        });
      });
    }
    
    console.log('PostList - Estado del caché de imágenes:', 
      Object.keys(userImagesCache).length > 0 ? 
        `${Object.keys(userImagesCache).length} imágenes en caché` : 
        'Caché vacío');
  }, [posts, userImagesCache]);

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6cda84]"></div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-[#575350]">No hay publicaciones disponibles.</p>
        <p className="text-[#3d7b6f] mt-2">¡Sé el primero en compartir algo con la comunidad!</p>
      </div>
    );
  }

  // Filtrar los posts válidos para mostrar
  const validPosts = posts.filter(post => {
    if (!post || !post.id) {
      console.warn('Post inválido encontrado (sin ID):', post);
      return false;
    }
    
    if (!post.contenido) {
      console.warn(`Post ${post.id} inválido (sin contenido)`, post);
      return false;
    }
    
    return true;
  });

  console.log(`PostList - ${posts.length} posts recibidos, ${validPosts.length} válidos para mostrar`);

  return (
    <div>
      <div className="space-y-4">
        {validPosts.map(post => (
          <PostItem 
            key={post.id} 
            post={post} 
            userImagesCache={userImagesCache} 
            userId={userId}
            onCommentSubmit={onCommentSubmit}
            onDeletePost={onDeletePost}
          />
        ))}
      </div>
      
      {validPosts.length > 0 && onLoadMore && (
        <button 
          className="mt-4 w-full py-2 bg-white text-[#3d7b6f] rounded-lg hover:bg-[#f8ffe5] border border-gray-200 transition-colors"
          onClick={onLoadMore}
        >
          Ver más publicaciones
        </button>
      )}
    </div>
  );
};

export default PostList; 