import React from 'react';
import logoImage from '../../assets/logo.png';

interface AuthLogoProps {
  onLogoClick?: () => void;
}

/**
 * Componente que muestra el logo y el eslogan de la aplicación
 * Se utiliza en las páginas de autenticación (login/registro)
 */
const AuthLogo: React.FC<AuthLogoProps> = ({ onLogoClick }) => {
  return (
    <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-[#3d7b6f]">
      <div className="text-center">
        <img 
          src={logoImage} 
          alt="Logo" 
          className="w-500 h-500 mx-auto cursor-pointer" 
          onClick={onLogoClick} 
        />
        <h1 className="text-white text-4xl font-bold mt-6">patitas</h1>
        <p className="text-[#f8ffe5] mt-2 text-lg">Conectando vidas, una patita a la vez</p>
      </div>
    </div>
  );
};

export default AuthLogo; 