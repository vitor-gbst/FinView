import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { authService } from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para saber a URL atual
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/fechar no mobile

  // Função para saber se o item está ativo
  const isActive = (path) => location.pathname === path;

  // Função de Navegação
  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false); // Fecha o menu se estiver no celular
  };

  // Função de Logout
  const handleLogout = async () => {
    try {
      // 1. Avisa o backend para matar o cookie
      await authService.logout();
      
      // 2. (Opcional) Se você usar Context/Localstorage, limpe aqui também
      // localStorage.removeItem('user_data'); 
      
      // 3. Agora sim, redireciona. Sem o cookie, o ProtectedRoute não vai deixar voltar.
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair", error);
      // Mesmo se der erro na API, forçamos o usuário para o login
      navigate('/login');
    }
  };

  return (
    <>
      {/* Botão Mobile (Hambúrguer) */}
      <button 
        className="mobile-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'} 
      </button>

      {/* Fundo Escuro (Só aparece no mobile quando aberto) */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Principal */}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        
        {/* Logo */}
        <div className="logo" onClick={() => handleNavigate('/dashboard')} style={{cursor: 'pointer'}}>
          FINANÇAS <span>PRO</span>
        </div>

        {/* Menu */}
        <nav className="menu-nav">
          <MenuItem 
            active={isActive('/dashboard')} 
            onClick={() => handleNavigate('/dashboard')}
            icon="📊" // Você pode trocar por ícones SVG depois
          >
            Dashboard
          </MenuItem>

          <MenuItem 
            active={isActive('/transactions')} // Exemplo de rota futura
            onClick={() => handleNavigate('/transactions')} // Ainda não existe, pode deixar sem ação ou alert
            icon="💸"
          >
            Transações
          </MenuItem>

          <MenuItem 
            active={isActive('/reports')} 
            onClick={() => alert('Em breve')}
            icon="📈"
          >
            Relatórios
          </MenuItem>

          <MenuItem 
            active={isActive('/settings')} 
            onClick={() => alert('Em breve')}
            icon="⚙️"
          >
            Configurações
          </MenuItem>
        </nav>

        {/* Footer / Logout */}
        <div className="menu-footer">
          <div className="menu-item logout-btn" onClick={handleLogout}>
            <span style={{ marginRight: '10px' }}>🚪</span>
            Sair
          </div>
        </div>
      </div>
    </>
  );
};

// Componente auxiliar de item (agora aceita onClick e Icon)
const MenuItem = ({ children, active, onClick, icon }) => (
  <div 
    className={`menu-item ${active ? 'active' : ''}`} 
    onClick={onClick}
  >
    {icon && <span style={{ width: '24px', textAlign: 'center' }}>{icon}</span>}
    {children}
  </div>
);

export default Sidebar;