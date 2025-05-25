import React from 'react';
import BotonSeguir from '../common/BotonSeguir';

export interface AmigoCardProps {
    id: number;
    nombre: string;
    apellido?: string;
    img?: string;
    email?: string;
    onRemove: (amigo: any) => void;
}

/**
 * Componente para mostrar la información de un amigo en formato de tarjeta
 */
const AmigoCard: React.FC<AmigoCardProps> = (amigo) => {
  const { onRemove } = amigo;
  return (
    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="h-16 w-16 rounded-full bg-gray-300 overflow-hidden mr-4 flex-shrink-0">
        <img 
          src={amigo.img || '/default-avatar.svg'} 
          alt={amigo.nombre} 
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-avatar.svg';
          }}
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="text-lg font-medium text-[#3d7b6f]">
          {amigo.nombre} {amigo.apellido || ''}
        </h3>
        {amigo.email && (
          <p className="text-sm text-gray-500">{amigo.email}</p>
        )}
      </div>
      
      <div className="flex space-x-2">
        <BotonSeguir usuarioId={amigo.id} />
        <button 
          className="text-[#2e82dc] p-2 hover:bg-blue-50 rounded-full"
          title="Enviar mensaje"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </button>
        <button 
          className="text-red-500 p-2 hover:bg-red-50 rounded-full"
          title="Eliminar amigo"
          onClick={() => onRemove(amigo)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AmigoCard;
