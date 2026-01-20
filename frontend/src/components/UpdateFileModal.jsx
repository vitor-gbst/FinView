import React, { useState } from 'react';
import { projectService } from '../services/api';
import './UploadModal.css'; 
const UpdateFileModal = ({ isOpen, onClose, onSuccess, projectId }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!file) {
        setError("Por favor, selecione um arquivo.");
        return;
    }

    setLoading(true);
    setError('');

    try {
      await projectService.updateFile(projectId, file);
      alert("Arquivo atualizado com sucesso!");
      onSuccess(); 
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar. Verifique se o arquivo é válido.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleUpdate}>
          <div className="modal-header">
            <h2>Atualizar Planilha</h2>
            <p>Envie o arquivo mais recente deste mês.</p>
          </div>

          {error && <div className="alert-error" style={{padding: '10px', marginBottom: '15px'}}>{error}</div>}

          {!file ? (
            <div className="upload-area" onClick={() => document.getElementById('update-file-input').click()}>
              <input 
                id="update-file-input" 
                type="file" 
                hidden 
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <span style={{fontSize: '24px'}}>🔄</span>
              <p>Clique para substituir o arquivo atual</p>
            </div>
          ) : (
            <div className="file-info">
              <span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)} style={{border:'none', background:'transparent', color:'red', cursor:'pointer'}}>✕</button>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={handleClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading || !file}>
              {loading ? 'Enviando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFileModal;
