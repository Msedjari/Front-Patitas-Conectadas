import React from 'react';
import CommentList from './CommentList';
import { Comment, UserImagesCache } from './types';

interface CommentsSectionProps {
  comments: Comment[];
  userImagesCache: UserImagesCache;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Componente para mostrar la sección de comentarios
 */
const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  userImagesCache,
  loading,
  error,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#6cda84]"></div>
        <p className="text-sm text-[#575350] mt-1">Cargando comentarios...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button 
          onClick={onRetry}
          className="mt-1 text-xs text-[#3d7b6f] hover:underline"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }
  
  return (
    <CommentList 
      comments={comments}
      userImagesCache={userImagesCache}
    />
  );
};

export default CommentsSection; 