import React, { useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { getUserImage } from './HomeUtils';
import { UserImagesCache } from './types';

interface CommentFormProps {
  postId: number;
  userId: number | string;
  userImagesCache: UserImagesCache;
  onCommentSubmit?: (postId: number, text: string) => void;
}

/**
 * Componente para el formulario de comentarios con emoji picker
 */
const CommentForm: React.FC<CommentFormProps> = ({ 
  postId, 
  userId, 
  userImagesCache, 
  onCommentSubmit 
}) => {
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(e.target.value);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setCommentText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && onCommentSubmit) {
      onCommentSubmit(postId, commentText);
      setCommentText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
          <img 
            src={getUserImage(userImagesCache, typeof userId === 'number' ? userId : 1)} 
            alt="Avatar" 
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.svg';
            }}
          />
        </div>
        <div className="flex-1 flex items-center bg-[#f8ffe5] rounded-full overflow-hidden relative">
          <input 
            type="text" 
            placeholder="Escribe un comentario..." 
            className="w-full px-4 py-1.5 text-sm focus:outline-none bg-transparent"
            value={commentText}
            onChange={handleCommentChange}
          />
          <div className="flex items-center pr-2 space-x-1">
            <button 
              type="button"
              className="text-[#3d7b6f] p-1 hover:text-[#6cda84]"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              type="submit"
              className="text-[#3d7b6f] p-1 hover:text-[#6cda84]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.5 11.1l-17.9-9c-0.8-0.4-1.6 0.4-1.2 1.2l2.6 6.1c0.1 0.3 0.4 0.5 0.7 0.5l7.8 0.8c0.1 0 0.1 0.1 0 0.1l-7.8 0.8c-0.3 0-0.6 0.2-0.7 0.5l-2.6 6.1c-0.4 0.8 0.4 1.6 1.2 1.2l17.9-9c0.5-0.3 0.5-1 0-1.3z" />
              </svg>
            </button>
          </div>
          
          {/* Emoji Picker para comentarios */}
          {showEmojiPicker && (
            <div className="absolute right-0 bottom-10 z-10" ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={Theme.LIGHT}
                searchDisabled={false}
                skinTonesDisabled
                width={300}
                height={350}
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default CommentForm; 