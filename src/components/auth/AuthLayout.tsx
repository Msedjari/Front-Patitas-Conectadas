import React from 'react';
import AuthLogo from './AuthLogo';

interface AuthLayoutProps {
  children: React.ReactNode;
  onLogoClick?: () => void;
}

/**
 * Componente de layout para las páginas de autenticación
 * Proporciona una estructura común para login y registro
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children, onLogoClick }) => {
  return (
    <div className="container mx-auto px-4 min-h-screen flex items-center bg-[#f8ffe5]">
      <div className="max-w-6xl mx-auto flex flex-wrap shadow-lg rounded-xl overflow-hidden">
        {/* Lado del logo */}
        <AuthLogo onLogoClick={onLogoClick} />
        
        {/* Lado del formulario */}
        <div className="w-full md:w-1/2 bg-white p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 