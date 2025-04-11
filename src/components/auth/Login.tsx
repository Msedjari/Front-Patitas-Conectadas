import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';
import logoImage from '../../assets/logo.png';
import { config } from '../../config';

/**
 * Componente de inicio de sesión
 * Maneja la autenticación de usuarios y redirige al inicio tras un login exitoso
 */
const Login = () => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  
  // Estados para manejar errores y carga
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtener función de login del contexto de autenticación
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja los cambios en los campos del formulario
   * @param e - Evento de cambio del input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Maneja el envío del formulario de login
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Intentando iniciar sesión con:', formData.correo);
      
      // Si estamos en modo desarrollo, intentar con el login rápido para desarrolladores
      if (import.meta.env.DEV && formData.correo === 'dev@example.com' && formData.contrasena === 'dev') {
        console.log('Usando login rápido para desarrollo');
      }
      
      // Llamar a la función login desde el contexto de autenticación
      const success = await login(formData.correo, formData.contrasena);
      
      if (success) {
        console.log('Login exitoso, redirigiendo a inicio');
        navigate('/');
      } else {
        console.error('Login falló, pero no lanzó excepción');
        setError('Credenciales inválidas. Por favor, intente nuevamente.');
      }
    } catch (err) {
      console.error('Error en componente Login:', err);
      if (err instanceof Error) {
        setError(err.message || 'Credenciales inválidas. Por favor, intente nuevamente.');
      } else {
        setError('Credenciales inválidas. Por favor, intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para facilitar login rápido en desarrollo - Solo para uso durante el desarrollo
   * Esta función queda como una funcionalidad oculta para facilitar pruebas
   */
  const useDevLogin = () => {
    if (import.meta.env.DEV) {
      // En modo desarrollo, llenar los campos silenciosamente
      setFormData({
        correo: 'dev@example.com',
        contrasena: 'dev'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 min-h-screen flex items-center bg-[#f8ffe5]">
      <div className="max-w-6xl mx-auto flex flex-wrap shadow-lg rounded-xl overflow-hidden">
        {/* Logo on the left - col-6 */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-8 bg-[#3d7b6f]">
          <div className="text-center">
            <img 
              src={logoImage} 
              alt="Logo" 
              className="w-500 h-500 mx-auto" 
              onClick={useDevLogin} // Funcionalidad oculta para facilitar testing
            />
            <h1 className="text-white text-4xl font-bold mt-6">patitas</h1>
            <p className="text-[#f8ffe5] mt-2 text-lg">Conectando vidas, una patita a la vez</p>
          </div>
        </div>

        {/* Form on the right - col-6 */}
        <div className="w-full form-container md:w-1/2 bg-white p-8">
          <h2 className="text-2xl font-bold mb-6 text-[#2a2827] mb-10">Iniciar Sesión</h2>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {/* Info panel en modo desarrollo - Eliminado por solicitud del usuario */}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-[#2a2827] mb-2 text-left">
                Correo electrónico 
              </label>
              <input
                id="correo"
                name="correo"
                type="text"
                required
                className="w-full px-3 py-2 border border-[#2a2827]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e82dc] focus:border-[#2e82dc] transition-all bg-white"
                placeholder="Ingrese su correo o usuario"
                value={formData.correo}
                onChange={handleChange}
              />
            </div>
            
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
                placeholder="Ingrese su contraseña"
                value={formData.contrasena}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#6cda84] focus:ring-[#6cda84] border-[#2a2827]/30 rounded bg-white"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#2a2827] text-left">
                  Recordarme
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-[#3d7b6f] hover:bg-[#2d5c53] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3d7b6f] transition-colors"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
            
            <div className="text-center">
              <span className="text-[#2a2827]">¿No tienes una cuenta? </span>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                className="b1 justify-center items-center font-medium" 
                onClick={() => navigate('/register')}
              >
                Regístrate ahora
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center pt-4 border-t border-[#2a2827]/10">
            <p className="text-sm text-[#2a2827]/80">
              <strong className="font-semibold">¿Eres una organización?</strong> Crea una página para tu refugio de animales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 