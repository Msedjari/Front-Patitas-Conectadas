import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteEventoDialog: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow">
        <p>¿Seguro que quieres eliminar este evento?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onConfirm}>Sí, eliminar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventoDialog; 