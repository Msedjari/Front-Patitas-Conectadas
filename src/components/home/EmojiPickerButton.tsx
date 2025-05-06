import React, { useRef, useState, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

/**
 * Componente reutilizable para el selector de emojis
 */
const EmojiPickerButton: React.FC<EmojiPickerButtonProps> = ({ 
  onEmojiSelect, 
  disabled = false 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Efecto para cerrar el emoji picker cuando se hace clic fuera de él
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div className="relative">
      <button 
        type="button"
        className="text-[#3d7b6f] p-1 hover:text-[#6cda84]"
        onClick={(e) => {
          e.preventDefault();
          setShowEmojiPicker(!showEmojiPicker);
        }}
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
        </svg>
      </button>
      
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
  );
};

export default EmojiPickerButton; 