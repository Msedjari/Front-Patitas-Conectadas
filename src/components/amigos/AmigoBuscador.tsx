import React, { useState } from 'react';
import ActionButton from '../common/ActionButton';

interface AmigoBuscadorProps {
  onAddAmigo: (amigo: any) => void;
}

/**
 * Componente para buscar y agregar amigos
 */
const AmigoBuscador: React.FC<AmigoBuscadorProps> = ({
  onAddAmigo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Función simulada para buscar usuarios
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulamos una respuesta del servidor con datos mockeados
    setTimeout(() => {
      // En una implementación real, esta sería una llamada a la API
      const mockResults = [
        { id: 101, nombre: 'Ana', apellido: 'Sánchez', email: 'ana.sanchez@ejemplo.com' },
        { id: 102, nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@ejemplo.com' },
        { id: 103, nombre: 'Elena', apellido: 'Martínez', email: 'elena.martinez@ejemplo.com' }
      ].filter(user => 
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <h2 className="text-xl font-semibold text-[#3d7b6f] mb-4">Buscar Amigos</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3d7b6f]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <ActionButton 
          onClick={handleSearch}
          isLoading={isSearching}
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </ActionButton>
      </div>
      
      {searchResults.length > 0 ? (
        <div className="space-y-3 mt-4">
          <h3 className="text-sm font-medium text-gray-500">Resultados de búsqueda:</h3>
          {searchResults.map(user => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 border border-gray-100 rounded bg-gray-50"
            >
              <div>
                <p className="font-medium">{user.nombre} {user.apellido}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  onAddAmigo(user);
                  setSearchResults(prev => prev.filter(u => u.id !== user.id));
                }}
                className="bg-[#3d7b6f] text-white px-3 py-1 text-sm rounded hover:bg-[#2c5a51] transition-colors"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      ) : searchTerm && !isSearching ? (
        <p className="text-gray-500 text-center py-4">No se encontraron resultados para "{searchTerm}"</p>
      ) : null}
    </div>
  );
};

export default AmigoBuscador; 