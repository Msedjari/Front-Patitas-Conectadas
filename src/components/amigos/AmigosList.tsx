import React from 'react';
import AmigoCard from './AmigoCard';
import {AmigoCardProps} from './AmigoCard';
import EmptyState from '../common/EmptyState';

interface AmigosListProps {
  amigos: AmigoCardProps[];
  onRemoveAmigo: (amigos: any) => void;
}

/**
 * Componente para mostrar una lista de amigos
 */
const AmigosList: React.FC<AmigosListProps> = (props) => {
  const {onRemoveAmigo} = props;
  if (!props.amigos.length) {
    return (
      <EmptyState 
        message="No tienes amigos agregados aún" 
        description="Usa el buscador para encontrar y agregar amigos"
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[#3d7b6f] mb-4">Tus Amigos</h2>
      
      {props.amigos.map(amigo => (
        <AmigoCard 
          {...amigo}
          onRemove={onRemoveAmigo} 
        />
      ))}
    </div>
  );
};

export default AmigosList; 