import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { valoracionesService, Valoracion } from '../../services/valoracionesService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValoracionesUsuarioProps {
  usuarioId: number;
}

const ValoracionesUsuario: React.FC<ValoracionesUsuarioProps> = ({ usuarioId }) => {
  const { user } = useAuth();
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [puntuacion, setPuntuacion] = useState('5');
  const [contenido, setContenido] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [yaValore, setYaValore] = useState(false);
  const [miValoracion, setMiValoracion] = useState<Valoracion | null>(null);

  const cargarValoraciones = async () => {
    try {
      setLoading(true);
      const valoracionesRecibidas = await valoracionesService.getValoracionesRecibidas(usuarioId);
      setValoraciones(valoracionesRecibidas);
      
      // Verificar si el usuario actual ya valoró a este usuario
      if (user?.id) {
        const miVal = valoracionesRecibidas.find(v => v.autorId === user.id);
        setYaValore(!!miVal);
        setMiValoracion(miVal || null);
      }
    } catch (error) {
      console.error('Error al cargar valoraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarValoraciones();
  }, [usuarioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setFormLoading(true);
    try {
      await valoracionesService.crearValoracion(user.id, usuarioId, puntuacion, contenido);
      setShowForm(false);
      setContenido('');
      setPuntuacion('5');
      await cargarValoraciones();
    } catch (error) {
      console.error('Error al enviar valoración:', error);
      alert(error instanceof Error ? error.message : 'Error al enviar valoración');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEliminarValoracion = async () => {
    if (!miValoracion) return;
    
    if (window.confirm('¿Seguro que quieres eliminar tu valoración?')) {
      try {
        await valoracionesService.eliminarValoracion(miValoracion.id);
        await cargarValoraciones();
      } catch (error) {
        console.error('Error al eliminar valoración:', error);
        alert(error instanceof Error ? error.message : 'Error al eliminar valoración');
      }
    }
  };

  const calcularPromedioValoraciones = (): string => {
    if (valoraciones.length === 0) return '0';
    const suma = valoraciones.reduce((acc, val) => acc + parseInt(val.puntuacion), 0);
    return (suma / valoraciones.length).toFixed(1);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-[#3d7b6f] mb-4">Valoraciones ({valoraciones.length})</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="text-2xl font-bold mr-2">{calcularPromedioValoraciones()}</div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className="text-yellow-400 text-xl">
                {parseInt(calcularPromedioValoraciones()) >= star ? '★' : '☆'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {user?.id && user.id !== usuarioId && !yaValore && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#5aa86d]"
        >
          Valorar usuario
        </button>
      )}

      {user?.id && user.id !== usuarioId && yaValore && miValoracion && (
        <div className="mb-6 p-4 bg-[#f8ffe5] rounded-lg border border-[#e0e7d3]">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">Tu valoración:</p>
              <div className="flex text-yellow-400 my-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star}>
                    {parseInt(miValoracion.puntuacion) >= star ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-gray-700">{miValoracion.contenido}</p>
            </div>
            <button
              onClick={handleEliminarValoracion}
              className="text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block mb-2">Puntuación:</label>
            <select
              value={puntuacion}
              onChange={(e) => setPuntuacion(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="5">5 - Excelente</option>
              <option value="4">4 - Muy bueno</option>
              <option value="3">3 - Bueno</option>
              <option value="2">2 - Regular</option>
              <option value="1">1 - Malo</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Comentario:</label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-[#6cda84] text-white rounded-md hover:bg-[#5aa86d]"
            >
              {formLoading ? 'Enviando...' : 'Enviar valoración'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Cargando valoraciones...</p>
      ) : valoraciones.length === 0 ? (
        <p className="text-gray-500">Este usuario aún no tiene valoraciones.</p>
      ) : (
        <div className="space-y-4">
          {valoraciones
            .filter(v => v.autorId !== user?.id) // No mostrar mi valoración aquí, ya la mostramos arriba
            .map(valoracion => (
            <div key={valoracion.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between">
                <div className="flex items-center mb-2">
                  <div className="font-medium">{valoracion.nombreAutor} {valoracion.apellidoAutor}</div>
                  <div className="text-gray-500 text-sm ml-2">
                    {format(new Date(valoracion.fecha), 'dd MMM yyyy', { locale: es })}
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>
                      {parseInt(valoracion.puntuacion) >= star ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{valoracion.contenido}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValoracionesUsuario; 