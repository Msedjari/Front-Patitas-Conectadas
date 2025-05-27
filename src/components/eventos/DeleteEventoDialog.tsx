import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteEventoDialog: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-[#2a2827] mb-4">Confirmar eliminación</h3>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventoDialog; 