import React from 'react';
import { Post, UserImagesCache } from './types';
import PostItem from './PostItem';

interface PostListProps {
  posts: Post[];
  userImagesCache: UserImagesCache;
  userId: number | string;
  loading: boolean;
  onLoadMore?: () => void;
  onCommentSubmit?: (postId: number, text: string) => void;
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
  onCommentSubmit
}) => {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6cda84]"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-[#575350]">No hay publicaciones disponibles.</p>
        <p className="text-[#3d7b6f] mt-2">¡Sé el primero en compartir algo con la comunidad!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {posts.map(post => (
          <PostItem 
            key={post.id} 
            post={post} 
            userImagesCache={userImagesCache} 
            userId={userId}
            onCommentSubmit={onCommentSubmit}
          />
        ))}
      </div>
      
      {posts.length > 0 && onLoadMore && (
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