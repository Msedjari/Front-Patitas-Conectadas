import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import ActionButton from '../components/common/ActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EventoForm from '../components/eventos/EventoForm';
import EventosList from '../components/eventos/EventosList';

interface Evento {
  id?: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
}

const Eventos: React.FC = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  
  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEventos();
  }, []);
  
  // Función para cargar los eventos
  const fetchEventos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      const response = await fetch(`${config.apiUrl}/eventos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setEventos(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError('No se pudieron cargar los eventos. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Limpiar el formulario
  const resetForm = () => {
    setEditingEvento(null);
  };
  
  // Manejar envío del formulario
  const handleSubmitEvento = async (formData: Evento) => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      if (editingEvento?.id) {
        // Actualizar evento existente
        const response = await fetch(`${config.apiUrl}/eventos/${editingEvento.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const updated = await response.json();
        
        // Actualizar el estado con el evento actualizado
        setEventos(eventos.map(e => 
          e.id === editingEvento.id ? updated : e
        ));
      } else {
        // Crear nuevo evento
        const response = await fetch(`${config.apiUrl}/eventos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        const newEvento = await response.json();
        
        // Agregar el nuevo evento al estado
        setEventos([...eventos, newEvento]);
      }
      
      // Resetear formulario y ocultarlo
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error al guardar evento:', err);
      setError('No se pudo guardar el evento. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Preparar edición de evento
  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setShowForm(true);
  };
  
  // Eliminar evento
  const handleDelete = async (evento: Evento) => {
    if (!evento.id) return;
    
    if (!confirm(`¿Estás seguro de eliminar el evento "${evento.nombre}"?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem(config.session.tokenKey);
      
      const response = await fetch(`${config.apiUrl}/eventos/${evento.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      // Eliminar del estado
      setEventos(eventos.filter(e => e.id !== evento.id));
      setError(null);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setError('No se pudo eliminar el evento. Por favor, intenta de nuevo.');
    } finally {
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
          onRetry={fetchEventos}
        />
        
        {/* Formulario para crear/editar evento */}
        {showForm && (
          <EventoForm 
            initialData={editingEvento || undefined}
            onSubmit={handleSubmitEvento}
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
      </div>
    </div>
  );
};

export default Eventos; 