import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { projectService } from '../services/api';
import './ProjectAnalysisPage.css'; // Vamos salvar seu CSS aqui
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProjectAnalysisPage = () => {
  const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cores do Gráfico
  const COLORS = ['#05CD99', '#4318FF', '#EFF4FB', '#FFB547'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Busca a análise ESPECÍFICA deste projeto pelo ID
        const response = await projectService.getAnalysis(id);
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao carregar análise:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="layout-container" style={{justifyContent:'center', alignItems:'center'}}>Carregando...</div>;

  return (
    <div className="layout-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px'}}>
                ⬅
             </button>
             <div>
                <p className="breadcrumb">Projetos / Detalhes</p>
                {/* Se tiver o nome do projeto na resposta seria bom, senão usa genérico */}
                <h1>Análise do Projeto</h1>
             </div>
          </div>
        </header>

        {stats ? (
          <>
            {/* GRID DE KPIS (SEUS CARDS DE ESTATÍSTICA) */}
            <section className="stats-grid">
              <StatCard title="Total (Soma)" value={`R$ ${stats.sum?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
              <StatCard title="Média" value={`R$ ${stats.mean?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
              <StatCard title="Desvio Padrão" value={stats.std_dev?.toFixed(2)} />
              <StatCard 
                title="Retorno Total" 
                value={`${stats.total_return?.toFixed(2)}%`} 
                percentage={stats.total_return > 0} 
              />
            </section>

            {/* GRID DE GRÁFICOS (SEU RECHARTS) */}
            <section className="charts-grid">
              
              {/* Gráfico de Barras */}
              <div className="card chart-large">
                <h3>Evolução Temporal ({stats.column})</h3>
                <div className="chart-wrapper" style={{marginTop: '20px'}}>
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
                      <Bar dataKey="value" fill="#4318FF" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Pizza (Exemplo - Futuramente vira dados reais) */}
              <div className="card chart-small">
                <h3>Distribuição</h3>
                <div className="chart-wrapper center" style={{display:'flex', justifyContent:'center', alignItems:'center', height: '100%'}}>
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
           <div className="card">Erro ao carregar dados ou projeto vazio.</div>
        )}
      </main>
    </div>
  );
};

// Componente visual dos Cards de Cima
const StatCard = ({ title, value, percentage }) => (
  <div className="card stat-card">
    <div className="stat-info">
      <span>{title}</span>
      <h4>{value}</h4>
    </div>
    {percentage !== undefined && (
        <div className="stat-percentage" style={{ color: percentage ? '#05CD99' : '#E31A1A', backgroundColor: percentage ? '#E6FBF5' : '#FFF5F5' }}>
            {percentage ? '▲' : '▼'}
        </div>
    )}
  </div>
);

export default ProjectAnalysisPage;