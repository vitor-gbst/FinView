import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import { projectService } from '../services/api';
import './ProjectAnalysisPage.css'; 

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ProjectAnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS_PIE = ['#05CD99', '#E31A1A']; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await projectService.getAnalysis(id);
        setStats(response.data);
      } catch (err) {
        console.error("Erro ao carregar análise:", err);
        setError(err.response?.data?.error || "Não foi possível carregar os dados deste projeto.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id]);

  const fmt = (val) => val?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


  if (error) {
    return (
      <div className="layout-container">
        <Sidebar />
        <main className="main-content center-message">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h2>Erro na Análise</h2>
            <p>{error}</p>
            <div className="error-actions">
                <button onClick={() => navigate('/dashboard')} className="btn-ghost">Voltar</button>
                <button onClick={() => window.location.reload()} className="btn-primary">Tentar Novamente</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content center-message">
                <Loading message="Calculando Runway e Métricas..." />
            </main>
        </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        
        <header className="dashboard-header">
           <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <button 
                onClick={() => navigate('/dashboard')} 
                className="btn-back"
                title="Voltar"
             >
                ⬅
             </button>
             <div>
                <p className="breadcrumb">Projetos / Análise</p>
                <h1>{stats.health?.status || "Relatório Financeiro"}</h1>
             </div>
           </div>
        </header>

        <section className="stats-grid">
          <StatCard 
             title="Saldo em Caixa" 
             value={fmt(stats.health?.current_balance)} 
             icon="💰"
          />
          
          <StatCard 
             title="Burn Rate (Gasto/Mês)" 
             value={fmt(stats.health?.burn_rate)} 
             sub="Média de saídas mensais"
             isDanger={true} 
          />

          <StatCard 
             title="Runway Estimado" 
             value={stats.health?.runway_months > 100 ? "+100 Meses" : `${stats.health?.runway_months.toFixed(1)} Meses`}
             sub={`Data prevista: ${stats.health?.predicted_date || 'Indefinida'}`}
             isSuccess={stats.health?.runway_months > 6}
             isDanger={stats.health?.runway_months < 3}
          />
        </section>

        <section className="charts-grid">
          
          <div className="card chart-large">
            <div className="chart-header">
                <h3>Fluxo de Caixa Acumulado</h3>
                <small>Evolução do saldo dia a dia</small>
            </div>
            
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.balance_series}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#05CD99" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#05CD99" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString().slice(0,5)} 
                    stroke="#A3AED0"
                    fontSize={12}
                    minTickGap={30}
                  />
                  <YAxis stroke="#A3AED0" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0px 2px 10px rgba(0,0,0,0.1)' }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [fmt(value), "Saldo Acumulado"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#05CD99" 
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card chart-small">
            <h3>Entradas vs Saídas</h3>
            <div className="chart-wrapper center-chart">
               <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Receitas', value: stats.flow_summary?.total_inflow || 0 },
                      { name: 'Despesas', value: stats.flow_summary?.total_outflow || 0 }
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill={COLORS_PIE[0]} />
                    <Cell fill={COLORS_PIE[1]} />
                  </Pie>
                  <Tooltip formatter={(value) => fmt(value)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, isDanger, isSuccess }) => (
  <div className="card stat-card" style={{
      borderLeft: isDanger ? '4px solid #E31A1A' : isSuccess ? '4px solid #05CD99' : 'none'
  }}>
    <div className="stat-info">
      <span className="stat-title-row">
         {icon} {title}
      </span>
      <h4 style={{color: isDanger ? '#E31A1A' : '#2B3674'}}>{value}</h4>
      {sub && <small className="stat-sub">{sub}</small>}
    </div>
  </div>
);

export default ProjectAnalysisPage;