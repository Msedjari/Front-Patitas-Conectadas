import React from 'react';
import AmigoCard from './AmigoCard';
import EmptyState from '../common/EmptyState';

interface AmigosListProps {
  amigos: Array<{
    id: number;
    nombre: string;
    apellido?: string;
    img?: string;
    email?: string;
  }>;
  onRemoveAmigo: (amigo: any) => void;
}

/**
 * Componente para mostrar una lista de amigos
 */
const AmigosList: React.FC<AmigosListProps> = ({
  amigos,
  onRemoveAmigo
}) => {
  if (!amigos.length) {
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
      
      {amigos.map(amigo => (
        <AmigoCard 
          key={amigo.id} 
          amigo={amigo} 
          onRemove={onRemoveAmigo} 
        />
      ))}
    </div>
  );
};

export default AmigosList; 