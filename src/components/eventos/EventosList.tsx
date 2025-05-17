import React from 'react';
import { Evento } from '../../services/eventosService';

interface Props {
  eventos: Evento[];
  onEdit: (evento: Evento) => void;
  onDelete: (evento: Evento) => void;
}

const EventosList: React.FC<Props> = ({ eventos, onEdit, onDelete }) => (
  <ul>
    {eventos.map(ev => (
      <li key={ev.id} className="mb-4 p-4 border rounded">
        <h3>{ev.nombre}</h3>
        <p>{ev.descripcion}</p>
        <p><b>Ubicación:</b> {ev.ubicacion}</p>
        <p><b>Fecha:</b> {ev.fecha}</p>
        <button onClick={() => onEdit(ev)}>Editar</button>
        <button onClick={() => onDelete(ev)}>Eliminar</button>
      </li>
    ))}
  </ul>
);

export default EventosList; 