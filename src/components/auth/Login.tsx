import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';
import AuthLayout from './AuthLayout';
import FormInput from './FormInput';
import FormError from './FormError';
import AuthButton from './AuthButton';

/**
 * Componente de inicio de sesión
 * Maneja la autenticación de usuarios y redirige al inicio tras un login exitoso
 * Si el usuario fue redirigido desde otra página por falta de autenticación, 
 * lo devuelve a esa página después del login.
 */
const Login = () => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Estados para manejar errores y carga
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Obtener función de login del contexto de autenticación
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta a la que el usuario intentaba acceder antes de ser redirigido al login
  const from = location.state?.from || '/';

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
      console.log('Intentando iniciar sesión con:', formData.email);
      
      // Si estamos en modo desarrollo, intentar con el login rápido para desarrolladores
      if (import.meta.env.DEV && formData.email === 'dev@example.com' && formData.password === 'dev') {
        console.log('Usando login rápido para desarrollo');
      }
      
      // Llamar a la función login desde el contexto de autenticación
      await login(formData.email, formData.password);
      
      // Si llegamos a este punto, el login fue exitoso
      console.log('Login exitoso, redirigiendo a:', from);
      navigate(from, { replace: true });
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
        email: 'dev@example.com',
        password: 'dev'
      });
    }
  };

  return (
    <AuthLayout onLogoClick={useDevLogin}>
      <h2 className="text-2xl font-bold mb-10 text-[#2a2827]">Iniciar Sesión</h2>
      
      <FormError message={error} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="email"
          name="email"
          type="text"
          label="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          placeholder="Ingrese su correo o usuario"
        />
        
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          value={formData.password}
          onChange={handleChange}
          placeholder="Ingrese su contraseña"
        />

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

        <AuthButton
          type="submit"
          disabled={isLoading}
          primary={true}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </AuthButton>
        
        <div className="text-center">
          <span className="text-[#2a2827]">¿No tienes una cuenta? </span>
        </div>
        <div className="flex justify-center">
          <AuthButton
            primary={false}
            onClick={() => navigate('/register')}
          >
            Regístrate ahora
          </AuthButton>
        </div>
      </form>
      
      <div className="mt-6 text-center pt-4 border-t border-[#2a2827]/10">
        <p className="text-sm text-[#2a2827]/80">
          <strong className="font-semibold">¿Eres una organización?</strong> Crea una página para tu refugio de animales.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login; 