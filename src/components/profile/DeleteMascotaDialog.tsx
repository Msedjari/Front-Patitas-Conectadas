import React from 'react';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import { Mascota } from '../../services/mascotasService';

interface DeleteMascotaDialogProps {
  isOpen: boolean;
  mascota: Mascota | null;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Componente para confirmar la eliminación de una mascota
 * Utiliza el DeleteConfirmDialog como base y añade lógica específica para mascotas
 */
const DeleteMascotaDialog: React.FC<DeleteMascotaDialogProps> = ({
  isOpen,
  mascota,
  onClose,
  onConfirm
}) => {
  if (!mascota) return null;

  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      title="Eliminar mascota"
      message={`¿Estás seguro de que deseas eliminar a ${mascota.nombre}? Esta acción no se puede deshacer y se eliminarán todos los datos asociados a esta mascota.`}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default DeleteMascotaDialog; 