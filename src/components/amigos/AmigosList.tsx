import React from 'react';
import AmigoCard, { AmigoCardProps } from './AmigoCard';
import EmptyState from '../common/EmptyState';

interface AmigosListProps {
  amigos: AmigoCardProps[];
  onRemoveAmigo: (amigo: AmigoCardProps) => void;
}

/**
 * Componente para mostrar una lista de amigos
 */
const AmigosList: React.FC<AmigosListProps> = ({ amigos, onRemoveAmigo }) => {
  if (amigos.length === 0) {
    return (
      <EmptyState 
        message="No tienes amigos aún"
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[#3d7b6f] mb-4">Tus Amigos</h2>
      
      {amigos.map((amigo) => (
        <AmigoCard
          key={amigo.id}
          {...amigo}
          onRemove={onRemoveAmigo}
        />
      ))}
    </div>
  );
};

export default AmigosList; 