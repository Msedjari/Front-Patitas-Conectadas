import React, { useRef, useState } from 'react';
import { UserImagesCache, CommentData } from './types';
import UserAvatar from './UserAvatar';
import CommentInput from './CommentInput';
import EmojiPickerButton from './EmojiPickerButton';
import SendButton from './SendButton';

interface CommentFormProps {
  postId: number;
  userId: number | string;
  userImagesCache: UserImagesCache;
  onCommentSubmit?: (commentData: CommentData) => void;
  isSubmitting?: boolean;
}

/**
 * Componente para el formulario de comentarios con emoji picker
 */
const CommentForm: React.FC<CommentFormProps> = ({ 
  postId, 
  userId, 
  userImagesCache, 
  onCommentSubmit,
  isSubmitting = false
}) => {
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
  };

  const handleEmojiSelect = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    
    // Enfocar el input para continuar escribiendo
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && onCommentSubmit && userId) {
      const commentData: CommentData = {
        postId,
        contenido: commentText,
        creadorId: Number(userId)
      };
      
      onCommentSubmit(commentData);
      
      // Limpiar el formulario
      setCommentText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100">
      <div className="flex items-center space-x-2">
        {/* Avatar del usuario */}
        <UserAvatar 
          userId={userId} 
          userImagesCache={userImagesCache} 
          size="md"
        />
        
        <div className="flex-1 relative">
          <div className="flex items-center bg-[#f8ffe5] rounded-full overflow-hidden">
            {/* Campo de texto del comentario */}
            <CommentInput 
              value={commentText}
              onChange={handleCommentChange}
              disabled={isSubmitting}
              inputRef={commentInputRef}
            />
            
            <div className="flex items-center pr-2 space-x-1">
              {/* Botón de emojis */}
              <EmojiPickerButton 
                onEmojiSelect={handleEmojiSelect}
                disabled={isSubmitting}
              />
              
              {/* Botón de enviar */}
              <SendButton
                disabled={!commentText.trim()}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
          
          {/* Indicador de carga */}
          {isSubmitting && (
            <div className="mt-1 text-xs text-[#3d7b6f]">
              Enviando comentario...
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default CommentForm; 