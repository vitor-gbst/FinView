import React from 'react';
import './DeleteModal.css'; 
import './UploadModal.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, projectName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
      <div className="modal-content delete-modal-content" onClick={e => e.stopPropagation()}>
        
        <div className="delete-icon-container">
          🗑️
        </div>

        <div className="modal-header center-text">
          <h2>Excluir Projeto?</h2>
          <p>
            Você está prestes a excluir <strong>{projectName}</strong>. 
            <br />
            Essa ação removerá todos os dados e o arquivo Excel permanentemente.
          </p>
        </div>

        <div className="modal-actions delete-actions">
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button 
            type="button" 
            className="btn-danger" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Excluindo...' : 'Sim, Excluir'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteModal;