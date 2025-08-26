import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import '../styles/login-page.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Force light mode for login page
  React.useEffect(() => {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep('password');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
    }

    setIsLoading(false);
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setStep('password');
  };

  const goBackToEmail = () => {
    setStep('email');
    setPassword('');
    setError(null);
  };

  return (
    <div className="login-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={16} />
        <span>Inicio</span>
      </Link>

      <div className="login-container">
        <div className="login-card">
          <div className="login-content">
            {/* Logo colorido estilo Apple */}
            <div className="logo-section">
              <img
                src="https://raw.githubusercontent.com/Esporadix-team/imagenes_logos/main/esporaLogo.png"
                alt="Espora"
                className="simple-logo"
              />
            </div>

            {/* Título */}
            <h1 className="login-title">
              {step === 'email' ? 'Inicia sesión con tu cuenta de' : 'Ingresa tu contraseña para'}
              <br />
              <span className="brand-name">Espora</span>
            </h1>

            {/* Formulario */}
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="login-form">
                <div className="input-container">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo o número telefónico"
                    required
                    className="main-input"
                    autoComplete="email"
                  />
                  <div className="input-arrow">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="login-form">
                <div className="user-info">
                  <span className="user-email">{email}</span>
                  <button
                    type="button"
                    className="change-user"
                    onClick={goBackToEmail}
                  >
                    Cambiar
                  </button>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    className="main-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading || !password}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Continuar'}
                </button>
              </form>
            )}

            {/* Credenciales de demostración */}
            {step === 'email' && (
              <div className="demo-section">
                <button
                  className="demo-title-button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                >
                  <span>Cuentas de prueba</span>
                  <span className={`demo-arrow ${showDemoAccounts ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </button>

                {showDemoAccounts && (
                  <div className="demo-grid">
                    <button
                      className="demo-item"
                      onClick={() => quickLogin('admin@espora.com', 'password')}
                    >
                      <span className="demo-role admin">Admin</span>
                      <span className="demo-email">admin@espora.com</span>
                    </button>
                    <button
                      className="demo-item"
                      onClick={() => quickLogin('operador@espora.com', 'espora2024')}
                    >
                      <span className="demo-role operator">Operador</span>
                      <span className="demo-email">operador@espora.com</span>
                    </button>
                    <button
                      className="demo-item"
                      onClick={() => quickLogin('capturista@espora.com', 'espora2024')}
                    >
                      <span className="demo-role user">Capturista</span>
                      <span className="demo-email">capturista@espora.com</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;