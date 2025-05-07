import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import AmigosList from '../components/amigos/AmigosList';
import AmigoBuscador from '../components/amigos/AmigoBuscador';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

interface Amigo {
  id: number;
  nombre: string;
  apellido?: string;
  img?: string;
  email?: string;
}

const Amigos: React.FC = () => {
  const { user } = useAuth();
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Definimos una función para refrescar los amigos
  const fetchAmigos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      const response = await fetch(`${config.apiUrl}/amigos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setAmigos(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar amigos:', err);
      setError('No se pudieron cargar los amigos. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar amigos al montar el componente
  useEffect(() => {
    fetchAmigos();
  }, []);
  
  // Agregar amigo
  const handleAddAmigo = async (nuevoAmigo: Amigo) => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      // En una implementación real, enviaríamos los datos al servidor
      // Mock de la respuesta exitosa para demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Agregar al estado
      setAmigos(prevAmigos => [...prevAmigos, nuevoAmigo]);
      setError(null);
    } catch (err) {
      console.error('Error al agregar amigo:', err);
      setError('No se pudo agregar el amigo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar amigo
  const handleRemoveAmigo = async (amigo: Amigo) => {
    if (!confirm(`¿Estás seguro de eliminar a ${amigo.nombre} de tus amigos?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      const response = await fetch(`${config.apiUrl}/amigos/${amigo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      // Eliminar del estado
      setAmigos(amigos.filter(a => a.id !== amigo.id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar amigo:', err);
      setError('No se pudo eliminar el amigo. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar amigos por término de búsqueda
  const filteredAmigos = amigos.filter(amigo => 
    `${amigo.nombre} ${amigo.apellido || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading && amigos.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-4xl px-4">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#3d7b6f] mb-6">Amigos</h1>
        
        {/* Mensaje de error */}
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)}
          onRetry={fetchAmigos}
        />
        
        {/* Buscador de nuevos amigos */}
        <AmigoBuscador onAddAmigo={handleAddAmigo} />
        
        {/* Buscador entre mis amigos */}
        <div className="mb-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filtrar mis amigos..." 
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6cda84]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Lista de amigos */}
        {filteredAmigos.length === 0 && searchTerm ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No se encontraron amigos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <AmigosList
            amigos={filteredAmigos}
            onRemoveAmigo={handleRemoveAmigo}
          />
        )}
      </div>
    </div>
  );
};

export default Amigos; 