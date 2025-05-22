import React, { useEffect, useState } from 'react';
import { notificacionesService, Notificacion } from '../services/notificacionesService';
import NotificacionItem from '../components/notificaciones/NotificacionItem';

const Notificaciones: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      const data = await notificacionesService.obtenerTodas();
      setNotificaciones(data);
    } catch (e) {
      setNotificaciones([]);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  return (
    <div className="notificaciones-container">
      <h2>Notificaciones</h2>
      {cargando ? (
        <div>Cargando...</div>
      ) : notificaciones.length === 0 ? (
        <div>No hay notificaciones.</div>
      ) : (
        <div className="notificaciones-lista">
          {notificaciones.map((n) => (
            <NotificacionItem key={n.id} notificacion={n} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notificaciones; 