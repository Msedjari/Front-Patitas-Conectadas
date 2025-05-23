import React, { useState } from 'react';
import { config } from '../../config';

interface AddValoracionProps {
  autorId: number;
  receptorId: number;
  onValoracionAdded: () => void;
}

const AddValoracion: React.FC<AddValoracionProps> = ({ autorId, receptorId, onValoracionAdded }) => {
  const [puntuacion, setPuntuacion] = useState<number>(0);
  const [contenido, setContenido] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem(config.session.tokenKey);
      const response = await fetch(`${config.apiUrl}/valoraciones/usuarios/${autorId}/receptor/${receptorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          puntuacion,
          contenido,
          fecha: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Error al añadir la valoración');
      }

      setPuntuacion(0);
      setContenido('');
      onValoracionAdded();
    } catch (error) {
      setError('No se pudo añadir la valoración. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-[#3d7b6f] mb-4">Añadir Valoración</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puntuación
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setPuntuacion(star)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= puntuacion ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">
            Comentario
          </label>
          <textarea
            id="contenido"
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6cda84] focus:border-transparent"
            rows={4}
            required
            placeholder="Escribe tu valoración aquí..."
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || puntuacion === 0 || !contenido.trim()}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || puntuacion === 0 || !contenido.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#6cda84] hover:bg-[#5bc073]'
          }`}
        >
          {loading ? 'Enviando...' : 'Enviar Valoración'}
        </button>
      </form>
    </div>
  );
};

export default AddValoracion; 