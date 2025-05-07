import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';
import AuthLayout from './AuthLayout';
import FormInput from './FormInput';
import FormError from './FormError';
import AuthButton from './AuthButton';

/**
 * Componente de Registro
 * Permite a los usuarios crear una nueva cuenta en la aplicación
 * Si el usuario fue redirigido desde otra página por falta de autenticación,
 * lo devuelve a esa página después del registro exitoso.
 */
const Register = () => {
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
  });
  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null);
  // Estado para indicar cuando el formulario está procesándose
  const [isLoading, setIsLoading] = useState(false);
  // Hook de autenticación que proporciona la función de registro
  const { register } = useAuth();
  // Hook de navegación para redireccionar después del registro exitoso
  const navigate = useNavigate();
  // Hook para obtener información de ubicación
  const location = useLocation();

  // Obtener la ruta a la que el usuario intentaba acceder antes de ser redirigido al registro
  const from = location.state?.from || '/';

  /**
   * Maneja los cambios en los campos del formulario
   * Actualiza el estado formData con los nuevos valores
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja el envío del formulario de registro
   * Valida que las contraseñas coincidan y envía los datos al servidor
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación de coincidencia de contraseñas
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Extraer confirmarContrasena para no enviarla al backend
      const { confirmarContrasena, ...userData } = formData;
      console.log('Enviando datos de registro:', userData);
      
      // Validaciones adicionales antes de enviar
      if (!formData.nombre.trim()) {
        setError('El nombre es obligatorio');
        return;
      }
      
      if (!formData.correo.trim()) {
        setError('El correo electrónico es obligatorio');
        return;
      }
      
      if (formData.contrasena.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      // Llamada a la función de registro del contexto de autenticación
      console.log('Llamando a función register con:', formData.nombre, formData.correo, '****', formData.apellido);
      await register(formData.nombre, formData.correo, formData.contrasena, formData.apellido);
      console.log('Registro exitoso, redirigiendo a:', from);
      // Redirección a la página de destino tras registro exitoso
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Error en componente Register:', err);
      // Manejo de diferentes tipos de errores
      if (err instanceof Error) {
        // Mostrar el mensaje de error exacto que viene del backend
        setError(err.message || 'Error al registrar usuario. Por favor, intente nuevamente.');
      } else {
        setError('Error al registrar usuario. Por favor, intente nuevamente.');
      }
    } finally {
      // Siempre desactivar el estado de carga al finalizar
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-[#2a2827]">Crear una cuenta nueva</h2>
      <p className="text-[#2a2827]/70 mb-6">Es rápido y fácil.</p>
      
      <FormError message={error} />
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Campos de nombre y apellido */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="nombre"
            name="nombre"
            type="text"
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingrese su nombre"
            className=""
          />
          <FormInput
            id="apellido"
            name="apellido"
            type="text"
            label="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ingrese su apellido"
            className=""
          />
        </div>
        
        <FormInput
          id="correo"
          name="correo"
          type="email"
          label="Correo electrónico"
          value={formData.correo}
          onChange={handleChange}
          placeholder="Ingrese su correo electrónico"
        />
        
        <FormInput
          id="contrasena"
          name="contrasena"
          type="password"
          label="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Cree una contraseña"
        />
        
        <FormInput
          id="confirmarContrasena"
          name="confirmarContrasena"
          type="password"
          label="Confirmar contraseña"
          value={formData.confirmarContrasena}
          onChange={handleChange}
          placeholder="Confirme su contraseña"
        />

        {/* Términos y botón de registro */}
        <div className="pt-2">
          <p className="text-xs text-[#2a2827]/70 mb-4">
            Al hacer clic en Registrarte, aceptas nuestros <a href="#" className="text-[#2e82dc] hover:text-[#1f68b5]">Términos</a>, la <a href="#" className="text-[#2e82dc] hover:text-[#1f68b5]">Política de privacidad</a> y la <a href="#" className="text-[#2e82dc] hover:text-[#1f68b5]">Política de cookies</a>.
          </p>
          
          <AuthButton
            type="submit"
            disabled={isLoading}
            primary={true}
          >
            {isLoading ? 'Registrando...' : 'Registrarte'}
          </AuthButton>
        </div>
        
        {/* Sección para iniciar sesión si ya tiene cuenta */}
        <div className="flex justify-center">
          <p className="text-[#2a2827]/70 mb-2">¿Ya tienes una cuenta?</p>
        </div>
        <div className="flex justify-center">
          <AuthButton
            primary={false}
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register; 