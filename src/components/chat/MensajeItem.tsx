import React from 'react';
import { Mensaje } from '../../services/chatService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MensajeItemProps {
  mensaje: Mensaje;
  esPropio: boolean;
}

const MensajeItem: React.FC<MensajeItemProps> = ({ mensaje, esPropio }) => {
  return (
    <div className={`mensaje-container ${esPropio ? 'mensaje-propio' : 'mensaje-otro'}`}>
      <div className={`mensaje ${esPropio ? 'mensaje-propio' : 'mensaje-otro'}`}>
        <p className="mensaje-contenido">{mensaje.contenido}</p>
        <span className="mensaje-fecha">
          {format(new Date(mensaje.fechaHora), 'HH:mm', { locale: es })}
        </span>
        {!esPropio && !mensaje.visto && (
          <span className="mensaje-no-visto">●</span>
        )}
      </div>
    </div>
  );
};

export default MensajeItem; 