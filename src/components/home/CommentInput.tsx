import React, { RefObject } from 'react';

interface CommentInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  inputRef?: RefObject<HTMLInputElement>;
}

/**
 * Componente reutilizable para el campo de texto de un comentario
 */
const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Escribe un comentario...",
  inputRef
}) => {
  return (
    <input 
      ref={inputRef}
      type="text" 
      placeholder={placeholder} 
      className="w-full px-4 py-1.5 text-sm focus:outline-none bg-transparent"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export default CommentInput; 