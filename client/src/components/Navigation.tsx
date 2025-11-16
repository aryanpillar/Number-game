import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthForm from './AuthForm';
import './Navigation.css';

function Navigation() {
  const { username, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
  };

  const handleAuthSuccess = () => {
    setShowAuthForm(false);
  };

  return (
    <>
      <nav className="navigation">
        <div className="nav-brand">
          <h1>Calculation Tree App</h1>
        </div>
        
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-status">
              <span className="username">Welcome, {username}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button onClick={() => setShowAuthForm(true)} className="login-button">
                Login / Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {showAuthForm && !isAuthenticated && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthForm(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-button" 
              onClick={() => setShowAuthForm(false)}
              aria-label="Close"
            >
              ×
            </button>
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
