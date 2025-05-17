import React from 'react';
import GrupoCard from './GrupoCard';
import EmptyState from '../common/EmptyState';

interface Grupo {
  id: number;
  nombre: string;
  descripcion: string;
}

interface GruposListProps {
  grupos: Grupo[];
  onDelete: (id: number) => void;
  onEdit: (grupo: Grupo) => void;
  onJoin: (grupo: any) => void;
  formatDate: (dateString?: string) => string;
  onCreateNew?: () => void;
}

/**
 * Componente para mostrar la lista de grupos
 */
const GruposList: React.FC<GruposListProps> = ({
  grupos,
  onDelete,
  onEdit,
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