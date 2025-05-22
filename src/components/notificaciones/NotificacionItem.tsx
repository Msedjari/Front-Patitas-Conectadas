import React from 'react';
import { Notificacion } from '../../services/notificacionesService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  notificacion: Notificacion;
}

const NotificacionItem: React.FC<Props> = ({ notificacion }) => (
  <div className="notificacion-item">
    <span className="notificacion-fecha">
      {format(new Date(notificacion.fecha), "PPPPp", { locale: es })}
    </span>
  </div>
);

export default NotificacionItem; 