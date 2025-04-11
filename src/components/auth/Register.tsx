import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';
import logoImage from '../../assets/logo.png';

/**
 * Componente de Registro
 * Permite a los usuarios crear una nueva cuenta en la aplicación
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
      // Llamada a la función de registro del contexto de autenticación
      await register(formData.nombre, formData.correo, formData.contrasena);
      console.log('Registro exitoso');
      // Redirección a la página principal tras registro exitoso
      navigate('/');
    } catch (err) {
      console.error('Error en componente Register:', err);
      // Manejo de diferentes tipos de errores
      if (err instanceof Error) {
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
    <div className="container mx-auto px-4 min-h-screen flex items-center bg-[#f8ffe5]">
      <div className="max-w-6xl mx-auto flex flex-wrap shadow-lg rounded-xl overflow-hidden">
        {/* Logo on the left */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-[#3d7b6f]">
          <div className="text-center">
            <img src={logoImage} alt="Logo" className="w-500 h-500 mx-auto" />
            <h1 className="text-white text-4xl font-bold mt-6">patitas</h1>
            <p className="text-[#f8ffe5] mt-2 text-lg">Conectando vidas, una patita a la vez</p>
          </div>
        </div>

        {/* Form on the right */}
        <div className="w-full md:w-1/2 bg-white p-8">
          <h2 className="text-2xl font-bold text-[#2a2827]">Crear una cuenta nueva</h2>
          <p className="text-[#2a2827]/70 mb-6">Es rápido y fácil.</p>
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Campos de nombre y apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-[#2a2827] mb-2 text-left">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[#2a2827]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e82dc] focus:border-[#2e82dc] transition-all bg-white"
                  placeholder="Ingrese su nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-[#2a2827] mb-2 text-left">
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[#2a2827]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e82dc] focus:border-[#2e82dc] transition-all bg-white"
                  placeholder="Ingrese su apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Campo de correo electrónico */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-[#2a2827] mb-2 text-left">
                Correo electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                className="w-full px-3 py-2 border border-[#2a2827]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e82dc] focus:border-[#2e82dc] transition-all bg-white"
                placeholder="Ingrese su correo electrónico"
                value={formData.correo}
                onChange={handleChange}
              />
            </div>
            
            {/* Campo de contraseña */}
            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-[#2a2827] mb-2 text-left">
                Contraseña
              </label>
              <input
                id="contrasena"
                name="contrasena"
                type="password"
                required
                className="w-full px-3 py-2 border border-[#2a2827]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e82dc] focus:border-[#2e82dc] transition-all bg-white"
                placeholder="Cree una contraseña"
                value={formData.contrasena}
                onChange={handleChange}
              />
            </div>
            
            {/* Campo de confirmación de contraseña */}
            <div>
              <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-[#2a2827] mb-2 text-left">
                Confirmar contraseña
              </label>
              <input
                id="confirmarContrasena"
                name="confirmarContrasena"
                type="password"
                required
                className="w-full px-3 py-2 border border-[#2a2827]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e82dc] focus:border-[#2e82dc] transition-all bg-white"
                placeholder="Confirme su contraseña"
                value={formData.confirmarContrasena}
                onChange={handleChange}
              />
            </div>

            {/* Términos y botón de registro */}
            <div className="pt-2">
              <p className="text-xs text-[#2a2827]/70 mb-4">
                Al hacer clic en Registrarte, aceptas nuestros <a href="#" className="text-[#2e82dc] hover:text-[#1f68b5]">Términos</a>, la <a href="#" className="text-[#2e82dc] hover:text-[#1f68b5]">Política de privacidad</a> y la <a href="#" className="text-[#2e82dc] hover:text-[#1f68b5]">Política de cookies</a>.
              </p>
              
              {/* Botón de registro con estado de carga */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#3d7b6f] hover:bg-[#2d5c53] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d7b6f] transition-colors"
              >
                {isLoading ? 'Registrando...' : 'Registrarte'}
              </button>
            </div>
            
            {/* Sección para iniciar sesión si ya tiene cuenta */}
            <div className="flex justify-center">
              <p className="text-[#2a2827]/70 mb-2">¿Ya tienes una cuenta?</p>
            </div>
            <div className="flex justify-center">
            <button
                type="button"
                className="b1 justify-center items-center font-medium" 
                onClick={() => navigate('/login')}
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 