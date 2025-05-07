import React from 'react';

/**
 * Componente de carga que se muestra mientras la aplicación se inicializa
 */
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-[rgb(252, 255, 243)]">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#6cda84]"></div>
      <p className="mt-4 text-lg text-[#3d7b6f]">Cargando Patitas Conectadas...</p>
    </div>
  </div>
);

export default LoadingScreen; 