import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import { projectService } from '../services/api';
import './DashboardPage.css'; 

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Erro ao buscar projetos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="layout-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <p className="breadcrumb">Dashboard / Projetos</p>
            <h1>Meus Projetos</h1>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + Novo Projeto
          </button>
        </header>

        {loading ? (
          <p>Carregando...</p>
        ) : projects.length === 0 ? (
          <div className="empty-state-container">
             <h3>Nenhum projeto encontrado</h3>
             <p>Importe sua primeira planilha para começar.</p>
          </div>
        ) : (
          <div className="projects-grid-list">
            {projects.map((project) => (
              <div key={project.ID} className="project-list-card">
                <div className="project-icon">📊</div>
                <div className="project-info">
                  <h3>{project.Name}</h3>
                  <p>Arquivo: {project.OriginalFilename}</p>
                </div>
                <button 
                  className="btn-view-analysis" 
                  onClick={() => navigate(`/project/${project.ID}`)}
                >
                  Ver Análise →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProjects} 
      />
    </div>
  );
};

export default DashboardPage;