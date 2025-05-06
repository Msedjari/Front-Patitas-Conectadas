import React from 'react';

interface SendButtonProps {
  disabled?: boolean;
  isSubmitting?: boolean;
  onClick?: () => void;
}

/**
 * Componente reutilizable para el botón de enviar
 */
const SendButton: React.FC<SendButtonProps> = ({ 
  disabled = false, 
  isSubmitting = false,
  onClick
}) => {
  return (
    <button 
      type="submit"
      className={`text-[#3d7b6f] p-1 ${isSubmitting || disabled ? 'opacity-50' : 'hover:text-[#6cda84]'}`}
      disabled={disabled || isSubmitting}
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.5 11.1l-17.9-9c-0.8-0.4-1.6 0.4-1.2 1.2l2.6 6.1c0.1 0.3 0.4 0.5 0.7 0.5l7.8 0.8c0.1 0 0.1 0.1 0 0.1l-7.8 0.8c-0.3 0-0.6 0.2-0.7 0.5l-2.6 6.1c-0.4 0.8 0.4 1.6 1.2 1.2l17.9-9c0.5-0.3 0.5-1 0-1.3z" />
      </svg>
    </button>
  );
};

export default SendButton; 