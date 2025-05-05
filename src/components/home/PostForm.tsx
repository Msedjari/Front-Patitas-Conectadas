import React, { useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { PostData, UserImagesCache } from './types';
import { getUserImage } from './HomeUtils';

interface PostFormProps {
  userId: number | string;
  userName?: string;
  userImagesCache: UserImagesCache;
  onPostSubmit: (postData: PostData) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Componente para el formulario de creación de posts con emoji picker
 */
const PostForm: React.FC<PostFormProps> = ({
  userId,
  userName,
  userImagesCache,
  onPostSubmit,
  isSubmitting
}) => {
  const [postText, setPostText] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprobar que hay al menos texto o imagen
    if (!postText.trim() && !postImageUrl) return;
    
    const postData: PostData = {
      contenido: postText,
      creador: {
        id: userId
      }
    };
    
    if (postImageUrl) {
      postData.img = postImageUrl;
    }
    
    try {
      await onPostSubmit(postData);
      
      // Limpiar el formulario
      setPostText('');
      setPostImageUrl('');
    } catch (error) {
      console.error('Error al crear el post desde el componente:', error);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostImageUrl(e.target.value);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setPostText(prevText => prevText + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <form onSubmit={handlePostSubmit} className="bg-white rounded-lg shadow-sm mb-4 p-4 border border-gray-200">
      <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-200">
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
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
        <div className="flex-1 relative">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full bg-[#f8ffe5] text-[#575350] rounded-lg px-4 py-2.5 min-h-[40px] resize-none focus:outline-none focus:ring-1 focus:ring-[#6cda84]"
            placeholder={`¿Qué estás pensando, ${userName?.split(' ')[0] || 'Usuario'}?`}
          />
          <button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 bottom-3 text-[#3d7b6f] hover:text-[#6cda84]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Emoji Picker para el post */}
          {showEmojiPicker && (
            <div className="absolute right-0 z-10 mt-1" ref={emojiPickerRef}>
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
      
      {/* Campo para URL de imagen */}
      <div className="flex items-center space-x-4 mt-3">
        <label className="flex items-center space-x-2 cursor-pointer text-[#3d7b6f] hover:text-[#2d5c53] p-2 rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span>Imagen URL</span>
        </label>
        <input 
          type="text" 
          value={postImageUrl}
          onChange={handleImageUrlChange}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="flex-1 bg-[#f8ffe5] text-[#575350] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#6cda84]"
        />
      </div>
      
      {/* Previsualización de imagen */}
      {postImageUrl && (
        <div className="relative mt-3">
          <img 
            src={postImageUrl} 
            alt="Vista previa" 
            className="h-24 object-cover rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/sample-post-image.svg';
            }}
          />
          <button 
            type="button"
            onClick={() => setPostImageUrl('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Botón de envío */}
      <button 
        type="submit"
        disabled={(!postText.trim() && !postImageUrl) || isSubmitting}
        className="w-full py-2 px-4 mt-4 bg-[#3d7b6f] text-white rounded-md hover:bg-[#2d5c53] transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
};

export default PostForm; 