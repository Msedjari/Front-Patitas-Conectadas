import React from 'react';

interface CommentsButtonProps {
  count: number;
  onClick: () => void;
  isActive: boolean;
}

/**
 * Componente para el botón de mostrar/ocultar comentarios
 */
const CommentsButton: React.FC<CommentsButtonProps> = ({ count, onClick, isActive }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-1 text-sm ${isActive ? 'text-[#3d7b6f] font-medium' : 'text-[#575350] hover:text-[#3d7b6f]'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <span>
        {count} Comentarios
      </span>
    </button>
  );
};

export default CommentsButton; 