import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importante: Conecta com o Contexto
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Pegamos a função de login e o estado de autenticação do contexto
  const { login, isAuthenticated, error, loading } = useAuth(); 
  const navigate = useNavigate();

  // Efeito: Assim que o usuário for autenticado (isAuthenticated virar true), muda de página
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Chama a função real que bate no backend Go
    await login(email, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div className="auth-header">
          <h2>Entrar</h2>
          <p>Digite seu email e senha para acessar.</p>
        </div>

        {/* Exibe mensagem de erro se o login falhar */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="exemplo@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="keep-logged" />
            <label htmlFor="keep-logged">Manter conectado</label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar Plataforma'}
          </button>
        </form>

        <div className="auth-footer">
          Ainda não tem conta? <Link to="/signup" className="auth-link">Criar conta</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;