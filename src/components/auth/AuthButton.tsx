import React from 'react';

interface AuthButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  className?: string;
}

/**
 * Componente de botón estilizado para las páginas de autenticación
 */
const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  primary = true,
  className = ''
}) => {
  const baseClasses = "w-full py-2 px-4 rounded-md font-medium transition-colors";
  const primaryClasses = primary
    ? "border border-transparent shadow-sm text-white bg-[#3d7b6f] hover:bg-[#2d5c53] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d7b6f]"
    : "text-[#3d7b6f] hover:text-[#2d5c53] hover:underline";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${primaryClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default AuthButton; 