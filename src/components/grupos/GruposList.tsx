import React from 'react';
import GrupoCard from './GrupoCard';
import EmptyState from '../common/EmptyState';

interface GruposListProps {
  grupos: Array<{
    id?: number;
    nombre: string;
    descripcion: string;
    num_miembros?: number;
    fecha_creacion?: string;
    creador_id?: number;
  }>;
  onEdit: (grupo: any) => void;
  onDelete: (grupo: any) => void;
  onJoin: (grupo: any) => void;
  formatDate: (dateString?: string) => string;
  onCreateNew?: () => void;
}

/**
 * Componente para mostrar la lista de grupos
 */
const GruposList: React.FC<GruposListProps> = ({
  grupos,
  onEdit,
  onDelete,
  onJoin,
  formatDate,
  onCreateNew
}) => {
  if (grupos.length === 0) {
    return (
      <EmptyState 
        message="No hay grupos disponibles."
        actionText={onCreateNew ? "Crea el primer grupo" : undefined}
        onAction={onCreateNew}
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {grupos.map(grupo => (
        <GrupoCard
          key={grupo.id}
          grupo={grupo}
          onEdit={onEdit}
          onDelete={onDelete}
          onJoin={onJoin}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default GruposList; 