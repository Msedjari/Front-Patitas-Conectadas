import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mascota, 
  createMascota, 
  updateMascota, 
  fetchMascotaById 
} from '../services/mascotasService';
import ActionButton from '../components/common/ActionButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { config } from '../config';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * Componente para crear o editar una mascota
 */
const MascotaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [mascota, setMascota] = useState<Mascota>({
    nombre: '',
    especie: '',
    genero: '',
    foto: '',
    usuarioId: user?.id ? Number(user.id) : 0,
    fechaNacimiento: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Cargar datos de la mascota si estamos editando
  useEffect(() => {
    const loadMascota = async () => {
      if (isEditing && user) {
        try {
          setLoading(true);
          setError(null);
          
          const mascotaData = await fetchMascotaById(Number(id), Number(user.id));
          setMascota(mascotaData);
        } catch (err) {
          console.error('Error al cargar la mascota:', err);
          setError('No se pudo cargar la información de la mascota. Intenta de nuevo más tarde.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadMascota();
  }, [id, isEditing, user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
      setMascota(prev => ({
        ...prev,
      [name as string]: value
      }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const formData = new FormData();
      formData.append('nombre', mascota.nombre);
      formData.append('genero', mascota.genero);
      formData.append('especie', mascota.especie);
      if (mascota.foto) formData.append('foto', mascota.foto);
      if (mascota.fechaNacimiento) formData.append('fechaNacimiento', mascota.fechaNacimiento);
      formData.append('usuarioId', user.id.toString());
      
      if (isEditing && id) {
        await updateMascota(Number(id), formData);
        setSuccess('Mascota actualizada exitosamente');
      } else {
        await createMascota(formData);
        setSuccess('Mascota creada exitosamente');
      }

      setTimeout(() => {
        navigate('/perfil');
      }, 2000);
    } catch (err) {
      console.error('Error al guardar la mascota:', err);
      setError('No se pudo guardar la mascota. Intenta de nuevo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar Mascota' : 'Nueva Mascota'}
          </h1>
          
        {error && <ErrorMessage message={error} />}
          {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
                  name="nombre"
                  value={mascota.nombre}
                  onChange={handleInputChange}
            margin="normal"
                  required
                />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Género</InputLabel>
            <Select
              name="genero"
              value={mascota.genero}
              onChange={handleInputChange}
              label="Género"
            >
              <MenuItem value="Macho">Macho</MenuItem>
              <MenuItem value="Hembra">Hembra</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Especie</InputLabel>
            <Select
                  name="especie"
                  value={mascota.especie}
                  onChange={handleInputChange}
              label="Especie"
            >
              <MenuItem value="Perro">Perro</MenuItem>
              <MenuItem value="Gato">Gato</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="URL de la foto"
            name="foto"
            value={mascota.foto}
                  onChange={handleInputChange}
            margin="normal"
                />

          <TextField
            fullWidth
            label="Fecha de Nacimiento"
            name="fechaNacimiento"
            type="date"
            value={mascota.fechaNacimiento}
                  onChange={handleInputChange}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
                  disabled={submitting}
                >
            {isEditing ? 'Actualizar Mascota' : 'Crear Mascota'}
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default MascotaForm; 