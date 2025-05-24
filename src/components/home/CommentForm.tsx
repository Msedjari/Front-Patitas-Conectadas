import React, { useRef, useState, useEffect } from 'react';
import { UserImagesCache, CommentData } from './types';
import UserAvatar from './UserAvatar';
import CommentInput from './CommentInput';
import EmojiPickerComponent from '../common/EmojiPicker';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar el emoji picker cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
  };

  const handleEmojiSelect = (emoji: string) => {
    setCommentText(prev => prev + emoji);
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
              inputRef={commentInputRef as React.RefObject<HTMLInputElement>}
            />
            
            <div className="flex items-center pr-2 space-x-1">
              {/* Botón de emojis */}
              <button
                type="button"
                className="text-[#3d7b6f] p-1 hover:text-[#6cda84]"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Botón de enviar */}
              <SendButton
                disabled={!commentText.trim()}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
          
          <div ref={emojiPickerRef}>
            <EmojiPickerComponent
              onEmojiSelect={handleEmojiSelect}
              showEmojiPicker={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
            />
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