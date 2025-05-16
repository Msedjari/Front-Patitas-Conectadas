import React, { useState } from 'react';
import ActionButton from '../common/ActionButton';
import ConfirmDialog from '../common/ConfirmDialog';

interface User {
  id: number;
  nombre: string;
  apellido: string;
}

interface ProfileActionsProps {
  user: User;
}

/**
 * Componente que muestra las acciones disponibles para el perfil del usuario
 * Solo visible en el perfil propio del usuario
 */
const ProfileActions: React.FC<ProfileActionsProps> = ({ user }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [dialogAction, setDialogAction] = useState<'logout' | 'delete' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Manejar la edición del perfil
  const handleEditProfile = () => {
    console.log('Editar perfil del usuario:', user.id);
    // Implementar redirección a la página de edición de perfil
  };
  
  // Mostrar diálogo de confirmación para cerrar sesión
  const handleLogoutConfirm = () => {
    setDialogAction('logout');
    setShowConfirmDialog(true);
  };
  
  // Mostrar diálogo de confirmación para eliminar cuenta
  const handleDeleteAccountConfirm = () => {
    setDialogAction('delete');
    setShowConfirmDialog(true);
  };
  
  // Cerrar diálogo de confirmación
  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
    setDialogAction(null);
  };
  
  // Ejecutar acción después de confirmar
  const handleConfirmAction = async () => {
    try {
      setIsLoading(true);
      
      if (dialogAction === 'logout') {
        // Implementar lógica para cerrar sesión
        console.log('Cerrando sesión...');
        // await logout();
      } else if (dialogAction === 'delete') {
        // Implementar lógica para eliminar cuenta
        console.log('Eliminando cuenta...');
        // await deleteAccount(user.id);
      }
      
      // Cerrar diálogo
      setShowConfirmDialog(false);
      setDialogAction(null);
    } catch (error) {
      console.error('Error al ejecutar acción:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Configurar propiedades del diálogo según la acción
  const getDialogProps = () => {
    if (dialogAction === 'logout') {
      return {
        title: 'Cerrar sesión',
        message: '¿Estás seguro de que deseas cerrar tu sesión?',
        confirmText: 'Cerrar sesión',
        variant: 'warning' as const
      };
    } else if (dialogAction === 'delete') {
      return {
        title: 'Eliminar cuenta',
        message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás toda tu información, mascotas y conexiones.',
        confirmText: 'Eliminar cuenta',
        variant: 'danger' as const
      };
    }
    
    return {
      title: '',
      message: '',
      confirmText: '',
      variant: 'info' as const
    };
  };
  
  const dialogProps = getDialogProps();
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-4 mb-6">
      <div className="flex flex-wrap gap-4 justify-end">
        <ActionButton
          variant="outline"
          onClick={handleEditProfile}
        >
          Editar perfil
        </ActionButton>
        
        <ActionButton
          variant="secondary"
          onClick={handleLogoutConfirm}
        >
          Cerrar sesión
        </ActionButton>
        
        <ActionButton
          variant="danger"
          onClick={handleDeleteAccountConfirm}
        >
          Eliminar cuenta
        </ActionButton>
      </div>
      
      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={dialogProps.title}
        message={dialogProps.message}
        confirmText={dialogProps.confirmText}
        cancelText="Cancelar"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelDialog}
        isLoading={isLoading}
        variant={dialogProps.variant}
      />
    </div>
  );
};

export default ProfileActions; 