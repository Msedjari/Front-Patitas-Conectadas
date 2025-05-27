import React, { useState, useEffect, useRef } from 'react';
import { notificacionesService, Notificacion } from '../../services/notificacionesService';
import { websocketService } from '../../services/websocketService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from '../common/LoadingSpinner';

interface NotificacionesDropdownProps {
  onClose: () => void;
}

const NotificacionesDropdown: React.FC<NotificacionesDropdownProps> = ({ onClose }) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noLeidas, setNoLeidas] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      const [data, noLeidasCount] = await Promise.all([
        notificacionesService.obtenerTodas(),
        notificacionesService.obtenerNoLeidas()
      ]);
      setNotificaciones(data.slice(0, 5)); // Solo mostrar las 5 más recientes
      setNoLeidas(noLeidasCount);
    } catch (e) {
      console.error('Error al cargar notificaciones:', e);
      setNotificaciones([]);
    }
    setCargando(false);
  };

  const handleMarcarComoLeida = async (id: number) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error al marcar notificación como leída:', e);
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await notificacionesService.marcarTodasComoLeidas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (e) {
      console.error('Error al marcar todas las notificaciones como leídas:', e);
    }
  };

  useEffect(() => {
    cargarNotificaciones();

    // Suscribirse a nuevas notificaciones
    const unsubscribe = websocketService.onNotification((data) => {
      if (data.type === 'notification') {
        cargarNotificaciones();
      }
    });

    // Cerrar el dropdown al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const renderNotificacion = (notificacion: Notificacion) => {
    const fecha = format(new Date(notificacion.fecha), "d 'de' MMMM 'a las' HH:mm", { locale: es });
    
    return (
      <div 
        key={notificacion.id} 
        className={`p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
          !notificacion.leida ? 'bg-blue-50' : ''
        }`}
        onClick={() => !notificacion.leida && handleMarcarComoLeida(notificacion.id)}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {notificacion.tipo === 'mensaje' && (
              <div className="w-8 h-8 rounded-full bg-[#3d7b6f] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            )}
            {notificacion.tipo === 'evento' && (
              <div className="w-8 h-8 rounded-full bg-[#6cda84] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {notificacion.tipo === 'seguidor' && (
              <div className="w-8 h-8 rounded-full bg-[#2e82dc] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#2a2827]">
              {notificacion.mensaje}
            </p>
            {notificacion.tipo === 'mensaje' && notificacion.datos?.contenido && (
              <p className="mt-1 text-xs text-[#575350] line-clamp-2">
                {notificacion.datos.contenido}
              </p>
            )}
            <p className="mt-1 text-xs text-[#575350]">
              {fecha}
            </p>
          </div>
          {!notificacion.leida && (
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-[#3d7b6f] rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[#3d7b6f]">Notificaciones</h3>
          {noLeidas > 0 && (
            <button
              onClick={handleMarcarTodasComoLeidas}
              className="text-xs text-[#3d7b6f] hover:text-[#2e5d54]"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {cargando ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-4 text-sm text-[#575350]">
            No hay notificaciones
          </div>
        ) : (
          notificaciones.map(renderNotificacion)
        )}
      </div>

      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <a 
          href="/notificaciones" 
          className="block text-center text-sm text-[#3d7b6f] hover:text-[#2e5d54]"
        >
          Ver todas las notificaciones
        </a>
      </div>
    </div>
  );
};

export default NotificacionesDropdown; 