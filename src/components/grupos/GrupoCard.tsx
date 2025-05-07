import React from 'react';
import ActionButton from '../common/ActionButton';

interface GrupoCardProps {
  grupo: {
    id?: number;
    nombre: string;
    descripcion: string;
    num_miembros?: number;
    fecha_creacion?: string;
    creador_id?: number;
  };
  onEdit: (grupo: any) => void;
  onDelete: (grupo: any) => void;
  onJoin: (grupo: any) => void;
  formatDate: (dateString?: string) => string;
}

/**
 * Componente para mostrar la información de un grupo en formato de tarjeta
 */
const GrupoCard: React.FC<GrupoCardProps> = ({
  grupo,
  onEdit,
  onDelete,
  onJoin,
  formatDate
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-[#3d7b6f] mb-2">{grupo.nombre}</h3>
          
          <div className="flex space-x-2">
            <button 
              className="text-[#2e82dc] hover:text-[#1f68b5]"
              onClick={() => onEdit(grupo)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(grupo)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <p className="text-[#575350] text-sm mb-3 line-clamp-3">{grupo.descripcion}</p>
        
        <div className="flex items-center text-[#3d7b6f] text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span>{grupo.num_miembros || 0} miembros</span>
        </div>
        
        <div className="text-xs text-[#575350] mt-2">
          Creado el {formatDate(grupo.fecha_creacion)}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <ActionButton 
          variant="primary" 
          onClick={() => onJoin(grupo)}
          fullWidth
        >
          Unirse al grupo
        </ActionButton>
      </div>
    </div>
  );
};

export default GrupoCard; 