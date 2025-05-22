import React from 'react';
import { Group as Grupo } from '../../services/groupService';
import GrupoCard from './GrupoCard';
import EmptyState from '../common/EmptyState';

interface GruposListProps {
  grupos: Grupo[];
  onEdit?: (grupo: Grupo) => void;
  onDelete?: (grupo: Grupo) => void;
  formatDate: (date?: string) => string;
  onCreateNew?: () => void;
  userId?: number | string;
  emptyMessage?: string;
}

/**
 * Componente para mostrar la lista de grupos
 */
const GruposList: React.FC<GruposListProps> = ({ 
  grupos, 
  onEdit, 
  onDelete, 
  formatDate,
  onCreateNew,
  userId,
  emptyMessage = "No hay grupos disponibles. ¡Crea uno nuevo!"
}) => {
  // Verificar si el usuario es el creador de un grupo
  const isUserCreator = (grupo: Grupo): boolean => {
    if (!userId || !grupo.creador_id) return false;
    
    const creadorId = typeof grupo.creador_id === 'string' 
      ? parseInt(grupo.creador_id) 
      : grupo.creador_id;
      
    const userIdNum = typeof userId === 'string' 
      ? parseInt(userId) 
      : userId;
    
    return creadorId === userIdNum;
  };

  if (grupos.length === 0) {
    return (
      <EmptyState 
        message={emptyMessage}
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
          formatDate={formatDate}
          isUserCreator={isUserCreator(grupo)}
        />
      ))}
    </div>
  );
};

export default GruposList; 