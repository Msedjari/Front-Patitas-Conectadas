import React from 'react';
import ActionButton from '../common/ActionButton';

interface EventoCardProps {
  evento: {
    id?: number;
    nombre: string;
    descripcion: string;
    fecha: string;
    ubicacion: string;
  };
  onEdit: (evento: any) => void;
  onDelete: (evento: any) => void;
  formatDate: (dateString: string) => string;
}

/**
 * Componente para mostrar la información de un evento en formato de tarjeta
 */
const EventoCard: React.FC<EventoCardProps> = ({
  evento,
  onEdit,
  onDelete,
  formatDate
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-[#3d7b6f] mb-2">{evento.nombre}</h3>
          
          <div className="flex space-x-2">
            <button 
              className="text-[#2e82dc] hover:text-[#1f68b5]"
              onClick={() => onEdit(evento)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(evento)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <p className="text-[#575350] mb-4">{evento.descripcion}</p>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center text-[#3d7b6f]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{formatDate(evento.fecha)}</span>
          </div>
          
          <div className="flex items-center text-[#3d7b6f]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{evento.ubicacion}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ActionButton 
            variant="primary"
            className="mr-2"
          >
            Asistir
          </ActionButton>
          
          <ActionButton 
            variant="outline"
          >
            Compartir
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default EventoCard; 