import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import ActionButton from '../components/common/ActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EventoForm from '../components/events/EventoForm';
import EventosList from '../components/events/EventosList';
import DeleteEventoDialog from '../components/eventos/DeleteEventoDialog';
import { fetchEventos, createEvento, updateEvento, deleteEvento, Evento } from '../services/eventosService';

const Eventos: React.FC = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<Evento | null>(null);
  
  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      setEventos(await fetchEventos());
    } catch (e) {
      alert('Error al cargar eventos');
    }
    setLoading(false);
  };
  
  // Limpiar el formulario
  const resetForm = () => {
    setEditingEvento(null);
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (data: Omit<Evento, 'id' | 'creadorId'>) => {
    setLoading(true);
    try {
      if (editingEvento && editingEvento.id) {
        const updated = await updateEvento(editingEvento.id, data);
        setEventos(eventos.map(ev => ev.id === updated.id ? updated : ev));
      } else if (user?.id) {
        const created = await createEvento(data, user.id);
        setEventos([...eventos, created]);
      }
      setShowForm(false);
      setEditingEvento(null);
    } catch (e) {
      alert('Error al guardar evento');
    }
    setLoading(false);
  };
  
  // Preparar edición de evento
  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setShowForm(true);
  };
  
  // Eliminar evento
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
      } catch (e) {
        alert('Error al eliminar evento');
      }
      setLoading(false);
    }
  };
  
  // Formatear fecha para mostrar
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
        
        {/* Mensaje de error */}
        <ErrorMessage 
          message={error} 
          onClose={() => setError(null)}
          onRetry={fetchData}
        />
        
        {/* Formulario para crear/editar evento */}
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
        
        {/* Lista de eventos */}
        <EventosList 
          eventos={eventos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          formatDate={formatDate}
          onCreateNew={() => setShowForm(true)}
        />
        
        <DeleteEventoDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete} />
      </div>
    </div>
  );
};

export default Eventos; 