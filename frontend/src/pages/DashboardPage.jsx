import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import UpdateFileModal from '../components/UpdateFileModal';
import DeleteModal from '../components/DeleteModal';
import Loading from '../components/Loading'; 
import { projectService } from '../services/api';
import { useToast } from '../contexts/ToastContext'; 
import './DashboardPage.css';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  

  //Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast(); 

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Erro ao buscar projetos", err);
      addToast("Erro ao carregar projetos.", "error"); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ---  Modals handlers ---
  const openUpdateModal = (projectId) => {
    setProjectToUpdate(projectId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setDeleteLoading(true);
      await projectService.delete(projectToDelete.ID);
      
      setProjects(current => current.filter(p => p.ID !== projectToDelete.ID));
      
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      
      addToast("Projeto excluído com sucesso!", "success"); // <--- TOAST AQUI
    } catch (error) {
      console.error(error);
      addToast("Erro ao excluir. Tente novamente.", "error"); // <--- TOAST AQUI
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSuccess = (message) => {
      fetchProjects();
      addToast(message || "Operação realizada com sucesso!", "success");
  };

  return (
    <div className="layout-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'}}>
          <div>
            <p className="breadcrumb">Dashboard / Projetos</p>
            <h1>Meus Projetos</h1>
          </div>
          <button className="btn-primary" onClick={() => setIsUploadModalOpen(true)}>
            + Novo Projeto
          </button>
        </header>

        {loading ? (
          <div style={{marginTop: '50px'}}><Loading message="Carregando projetos..." /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state-container">
             <h3>Nenhum projeto encontrado</h3>
             <p>Importe sua primeira planilha para começar.</p>
             <button className="btn-ghost" style={{marginTop:'10px'}} onClick={() => setIsUploadModalOpen(true)}>Criar Agora</button>
          </div>
        ) : (
          <div className="projects-grid-list">
            {projects.map((project) => (
              <div key={project.ID} className="project-list-card">
                
                <div className="card-top-actions">
                    <button 
                      className="btn-action btn-update" 
                      onClick={() => openUpdateModal(project.ID)}
                      title="Atualizar Arquivo"
                    >
                      🔄
                    </button>

                    <button 
                      className="btn-action btn-delete" 
                      onClick={() => handleDeleteClick(project)} 
                      title="Excluir Projeto"
                    >
                      🗑️
                    </button>
                </div>

                <div className="project-icon">📊</div>
                <div className="project-info">
                  <h3>{project.Name}</h3>
                  <p className="filename-truncate" title={project.OriginalFilename}>
                      {project.OriginalFilename}
                  </p>
                  <small style={{color:'#ccc'}}>
                      {new Date(project.UpdatedAt).toLocaleDateString()}
                  </small>
                </div>

                <button 
                  className="btn-view-analysis" 
                  onClick={() => navigate(`/project/${project.ID}`)}
                  style={{marginTop: 'auto', width: '100%'}}
                >
                  Ver Análise →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSuccess={() => handleSuccess("Projeto criado com sucesso!")} 
      />
      <UpdateFileModal
        isOpen={isUpdateModalOpen}
        projectId={projectToUpdate}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => handleSuccess("Arquivo atualizado com sucesso!")}
      />
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        projectName={projectToDelete?.Name}
        loading={deleteLoading}
      />
    </div>
  );
};

export default DashboardPage;