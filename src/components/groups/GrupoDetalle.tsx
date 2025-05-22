import React from 'react';
import { Group as Grupo } from '../../services/groupService';

interface GrupoDetalleProps {
  grupo: Grupo;
}

const GrupoDetalle: React.FC<GrupoDetalleProps> = ({ grupo }) => {
  // Formatear fecha para mostrar
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Fecha no disponible';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Acerca de este grupo</h3>
        <p className="text-gray-700">{grupo.descripcion}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Historia</h3>
        <div className="flex items-center space-x-2 text-gray-600 mb-1">
          <span className="material-icons text-sm">event</span>
          <span>Creado el {formatDate(grupo.fecha_creacion)}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Reglas del grupo</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Ser respetuoso con todos los miembros</li>
          <li>No compartir contenido inapropiado</li>
          <li>Mantener las discusiones relacionadas con mascotas</li>
          <li>No hacer spam ni publicidad no autorizada</li>
          <li>Respetar la privacidad de otros miembros</li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Información adicional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Visibilidad</p>
            <p className="font-medium">Público</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Categoría</p>
            <p className="font-medium">Mascotas y Animales</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrupoDetalle; 