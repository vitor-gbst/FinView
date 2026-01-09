import React from 'react';
// Você pode usar ícones da biblioteca que preferir (ex: lucide-react, react-icons)
// Aqui vou usar texto simples simulando ícones por enquanto

const Sidebar = () => {
  return (
    <div style={{
      width: '290px',
      backgroundColor: 'var(--sidebar-bg)',
      height: '100vh',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed', // Sidebar fixa
      left: 0,
      top: 0
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '50px', fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        FINANÇAS <span style={{ color: 'var(--primary-color)' }}>PRO</span>
      </div>

      {/* Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <MenuItem active>Dashboard</MenuItem>
        <MenuItem>Transações</MenuItem>
        <MenuItem>Relatórios</MenuItem>
        <MenuItem>Configurações</MenuItem>
      </nav>

      {/* Footer do Menu */}
      <div style={{ marginTop: 'auto', color: 'var(--text-secondary)' }}>
        <p>Sair</p>
      </div>
    </div>
  );
};

// Componente auxiliar simples para o item do menu
const MenuItem = ({ children, active }) => (
  <div style={{
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: active ? 'bold' : 'normal',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingLeft: active ? '0' : '5px',
    borderRight: active ? '4px solid var(--primary-color)' : 'none'
  }}>
    {children}
  </div>
);

export default Sidebar;