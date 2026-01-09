import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import './DashboardPage.css'; // Removida a duplicata
import { projectService } from '../services/api';

// Imports de gráficos
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projResponse = await projectService.getAll();
      const userProjects = projResponse.data.projects;
      setProjects(userProjects);

      if (userProjects && userProjects.length > 0) {
        const currentProject = userProjects[userProjects.length - 1]; 
        const analysisResponse = await projectService.getAnalysis(currentProject.ID);
        setStats(analysisResponse.data);
      } else {
        setStats(null); // Garante que fique null se não tiver projetos
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#05CD99', '#4318FF', '#EFF4FB', '#FFB547'];

  // Loading simples
  if (loading) return <div className="layout-container center">Carregando dados...</div>;
  
  return (
    <div className="layout-container">
      <Sidebar />
      
      <main className="main-content">
        {/* O Header fica fora da verificação de stats, assim o botão SEMPRE aparece */}
        <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <p className="breadcrumb">Dashboard / Análise Financeira</p>
            <h1>Visão Geral</h1>
          </div>
          
          <button 
            className="btn-primary" 
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>+</span> Novo Projeto
          </button>
        </header>

        {/* Verificação: Se tem estatísticas, mostra os gráficos. Se não, mostra o aviso */}
        {stats ? (
          <>
            <section className="stats-grid">
              <StatCard title="Total (Soma)" value={`R$ ${stats.sum?.toFixed(2)}`} />
              <StatCard title="Média" value={`R$ ${stats.mean?.toFixed(2)}`} />
              <StatCard title="Desvio Padrão" value={stats.std_dev?.toFixed(2)} />
              <StatCard title="Retorno Total" value={`${stats.total_return?.toFixed(2)}%`} percentage={stats.total_return > 0} />
            </section>

            <section className="charts-grid">
              <div className="card chart-large">
                <h3>Evolução Temporal ({stats.column})</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.series}>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                        stroke="#A3AED0"
                        fontSize={12}
                      />
                      <YAxis stroke="#A3AED0" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0px 2px 5px rgba(0,0,0,0.1)' }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Bar dataKey="value" fill="#4318FF" radius={[10, 10, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card chart-small">
                <h3>Distribuição</h3>
                <div className="chart-wrapper center">
                   <PieChart width={200} height={200}>
                    <Pie
                      data={[{name: 'A', value: 400}, {name: 'B', value: 300}, {name: 'C', value: 300}]}
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </div>
            </section>
          </>
        ) : (
          // --- ESTADO VAZIO (NENHUM PROJETO) ---
          <div className="empty-state" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '60vh',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📂</div>
              <h2>Nenhum dado encontrado</h2>
              <p>Clique no botão "+ Novo Projeto" acima para começar.</p>
          </div>
        )}

      </main>

      {/* O Modal sempre está disponível na árvore de renderização */}
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
};

const StatCard = ({ title, value, percentage }) => (
  <div className="card stat-card">
    <div className="stat-info">
      <span>{title}</span>
      <h4>{value}</h4>
    </div>
    {percentage !== undefined && (
        <div className="stat-percentage" style={{ color: percentage ? '#05CD99' : '#E31A1A' }}>
            {percentage ? '▲' : '▼'}
        </div>
    )}
  </div>
);

export default DashboardPage;