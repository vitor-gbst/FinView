import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css'; // Usa o mesmo estilo do Login para manter o padrão

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const { signup } = useAuth(); // Pega a função do contexto
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // 1. Validação básica de senha no Frontend
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (formData.password.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    // 2. Chama a função de cadastro
    // Nota: O objeto abaixo deve bater com o que seu Backend Go espera no c.BindJSON
    const success = await signup({
      // Se o seu User struct no Go não tiver "Name", o backend pode ignorar este campo
      name: formData.name, 
      email: formData.email,
      password: formData.password
    });

    setLoading(false);

    if (success) {
      alert("Conta criada com sucesso! Faça login para continuar.");
      navigate('/login');
    }
    // Se der erro, o AuthContext já define o estado de erro, você pode exibir se quiser
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        <div className="auth-header">
          <h2>Criar Conta</h2>
          <p>Gerencie suas finanças de forma profissional.</p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          
          {/* Campo Nome */}
          <div className="input-group">
            <label htmlFor="name">Nome Completo</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Seu nome" 
              value={formData.name}
              onChange={handleChange}
              // required // Tire o comentário se o nome for obrigatório no banco
            />
          </div>

          {/* Campo Email */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="exemplo@email.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo Senha */}
          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Mínimo de 6 caracteres" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Campo Confirmar Senha */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="Repita a senha" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-footer">
          Já possui uma conta? <Link to="/login" className="auth-link">Fazer Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;