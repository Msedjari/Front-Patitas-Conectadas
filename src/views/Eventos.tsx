import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEventos, createEvento, updateEvento, deleteEvento, Evento } from '../services/eventosService';
import EventoForm from '../components/eventos/EventoForm';
import EventosList from '../components/eventos/EventosList';
import DeleteEventoDialog from '../components/eventos/DeleteEventoDialog';

const Eventos: React.FC = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      setEventos(await fetchEventos());
    } catch (e) {
      alert('Error al cargar eventos');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

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
      } catch (e) {
        alert('Error al eliminar evento');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[#3d7b6f]">Eventos</h1>
          <button onClick={() => { setShowForm(!showForm); setEditingEvento(null); }}>
            {showForm ? 'Cancelar' : 'Crear Evento'}
          </button>
        </div>
        {showForm && (
          <EventoForm
            initialData={editingEvento || undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingEvento(null); }}
            isLoading={loading}
          />
        )}
        <EventosList eventos={eventos} onEdit={handleEdit} onDelete={handleDelete} />
        <DeleteEventoDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete} />
      </div>
    </div>
  );
};

export default Eventos;