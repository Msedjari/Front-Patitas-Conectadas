import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import ActionButton from '../components/common/ActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EventoForm from '../components/eventos/EventoForm';
import EventosList from '../components/eventos/EventosList';
import DeleteEventoDialog from '../components/eventos/DeleteEventoDialog';
import { fetchEventos, createEvento, updateEvento, deleteEvento, Evento } from '../services/eventosService';
import { usuarioEventoService, UsuarioEvento } from '../services/usuarioEventoService';

const Eventos: React.FC = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [usuarioEventos, setUsuarioEventos] = useState<UsuarioEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<Evento | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener todas las relaciones usuario-evento
      const relaciones = await usuarioEventoService.getAllUsuarioEventos();
      setUsuarioEventos(relaciones);

      // Obtener todos los eventos
      const todosEventos = await fetchEventos();
      setEventos(todosEventos);
    } catch (e) {
      setError('Error al cargar eventos');
    }
    setLoading(false);
  };
  
  const resetForm = () => {
    setEditingEvento(null);
  };
  
  const handleSubmit = async (data: Omit<Evento, 'id' | 'creadorId'>) => {
    setLoading(true);
    try {
      if (editingEvento && editingEvento.id) {
        const updated = await updateEvento(editingEvento.id, data);
        setEventos(eventos.map(ev => ev.id === updated.id ? updated : ev));
      } else if (user?.id) {
        const created = await createEvento(data, Number(user.id));
        setEventos([...eventos, created]);
      }
      setShowForm(false);
      setEditingEvento(null);
      // Recargar las relaciones después de crear/actualizar
      const relaciones = await usuarioEventoService.getAllUsuarioEventos();
      setUsuarioEventos(relaciones);
    } catch (e) {
      setError('Error al guardar evento');
    }
    setLoading(false);
  };
  
  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setShowForm(true);
  };
  
  const handleDelete = (evento: Evento) => {
    setEventoToDelete(evento);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (eventoToDelete?.id) {
      setLoading(true);
      try {
        await deleteEvento(eventoToDelete.id);
        setEventos(eventos.filter(ev => ev.id !== eventoToDelete.id));
        setDeleteDialogOpen(false);
        setEventoToDelete(null);
        // Recargar las relaciones después de eliminar
        const relaciones = await usuarioEventoService.getAllUsuarioEventos();
        setUsuarioEventos(relaciones);
      } catch (e) {
        alert('Error al eliminar evento');
      }
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  const canEditEvento = (evento: Evento): boolean => {
    if (!user?.id) return false;
    const relacion = usuarioEventos.find(ue => 
      ue.eventoId === evento.id && 
      ue.usuarioId === Number(user.id) && 
      ue.rol === 'CREADOR'
    );
    return !!relacion;
  };

  const getEventoRol = (eventoId: number): string => {
    if (!user?.id) return '';
    const relacion = usuarioEventos.find(ue => 
      ue.eventoId === eventoId && 
      ue.usuarioId === Number(user.id)
    );
    return relacion?.rol || '';
  };
  
  if (loading && eventos.length === 0) {
    return <LoadingSpinner className="my-5" />;
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#3d7b6f]">Eventos</h1>
          <ActionButton 
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancelar' : 'Crear Evento'}
          </ActionButton>
        </div>
        
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)}
          onRetry={fetchData}
        />
        
        {showForm && (
          <EventoForm 
            initialData={editingEvento || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              resetForm();
              setShowForm(false);
            }}
            isLoading={loading}
          />
        )}
        
        <EventosList 
          eventos={eventos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          formatDate={formatDate}
          canEditEvento={canEditEvento}
          getEventoRol={getEventoRol}
          onEventoUpdate={fetchData}
        />
        
        <DeleteEventoDialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)} 
          onConfirm={confirmDelete} 
        />
      </div>
    </div>
  );
};

export default Eventos; 