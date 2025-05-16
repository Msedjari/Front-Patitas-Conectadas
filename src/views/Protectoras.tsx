import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

interface Protectora {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  telefono: string;
  email: string;
  imagen?: string;
}

/**
 * Componente para la vista de Protectoras
 * 
 * Muestra un listado de protectoras de animales
 */
const Protectoras: React.FC = () => {
  const [protectoras, setProtectoras] = useState<Protectora[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadProtectoras = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // En un escenario real, aquí se haría una llamada a la API
        // const response = await fetch(`${config.apiUrl}/protectoras`);
        // const data = await response.json();
        // setProtectoras(data);
        
        // Por ahora, usamos datos de ejemplo
        setTimeout(() => {
          setProtectoras([
            {
              id: 1,
              nombre: 'Refugio Patitas Felices',
              descripcion: 'Somos un refugio dedicado al rescate y adopción de perros y gatos abandonados.',
              ubicacion: 'Madrid',
              telefono: '912345678',
              email: 'contacto@patitasfelices.org',
              imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            },
            {
              id: 2,
              nombre: 'Asociación Amigos de los Animales',
              descripcion: 'Nuestra misión es rescatar, rehabilitar y encontrar hogares para animales abandonados.',
              ubicacion: 'Barcelona',
              telefono: '932345678',
              email: 'info@amigosdelosanimales.org',
              imagen: 'https://images.unsplash.com/photo-1551730459-92db2a308d6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            },
            {
              id: 3,
              nombre: 'Protectora Huellas',
              descripcion: 'Trabajamos para mejorar la vida de los animales sin hogar y fomentar la adopción responsable.',
              ubicacion: 'Valencia',
              telefono: '962345678',
              email: 'huellas@protectora.org',
              imagen: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            }
          ]);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error al cargar protectoras:', err);
        setError('No se pudieron cargar las protectoras. Intenta de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    loadProtectoras();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error}
          onClose={() => setError(null)}
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#3d7b6f] mb-8">Protectoras de Animales</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protectoras.map(protectora => (
          <div 
            key={protectora.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {protectora.imagen && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={protectora.imagen} 
                  alt={protectora.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#3d7b6f] mb-2">
                {protectora.nombre}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {protectora.descripcion}
              </p>
              
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Ubicación:</span> {protectora.ubicacion}
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span> {protectora.telefono}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {protectora.email}
                </p>
              </div>
              
              <div className="mt-4">
                <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#3d7b6f] hover:bg-[#326a60]">
                  Contactar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Protectoras; 