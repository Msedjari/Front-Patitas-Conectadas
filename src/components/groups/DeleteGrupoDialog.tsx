import React from 'react';
import ConfirmDialog from '../common/ConfirmDialog';
import { Group as Grupo } from '../../services/groupService';

interface DeleteGrupoDialogProps {
  isOpen: boolean;
  grupo: Grupo | null;
  onConfirm: (grupo: Grupo) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

/**
 * Componente para confirmar la eliminación de un grupo
 * Utiliza el ConfirmDialog como base y añade lógica específica para grupos
 */
const DeleteGrupoDialog: React.FC<DeleteGrupoDialogProps> = ({
  isOpen,
  grupo,
  onConfirm,
  onCancel,
  isLoading
}) => {
  // No renderizar nada si no hay grupo
  if (!grupo) return null;
  
  // Manejar la confirmación
  const handleConfirm = () => {
    onConfirm(grupo);
  };
  
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title="Eliminar grupo"
      message={`¿Estás seguro de que deseas eliminar el grupo "${grupo.nombre}"? Esta acción no se puede deshacer y eliminará todas las publicaciones y datos asociados al grupo.`}
      confirmText="Eliminar"
      cancelText="Cancelar"
      onConfirm={handleConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
      variant="danger"
    />
  );
};

export default DeleteGrupoDialog; 