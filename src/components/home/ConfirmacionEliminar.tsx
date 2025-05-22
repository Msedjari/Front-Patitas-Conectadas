import React from 'react';

interface ConfirmacionEliminarProps {
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ConfirmacionEliminar: React.FC<ConfirmacionEliminarProps> = ({ onConfirmar, onCancelar }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-[#2a2827] mb-4">Confirmar eliminación</h3>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={onConfirmar}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionEliminar; 