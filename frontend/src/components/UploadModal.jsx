import React, { useState } from 'react';
import './UploadModal.css';
import { projectService } from '../services/api';
import Alert from './Alert/Alert';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState(''); 

  const [step, setStep] = useState(1); 
  const [projectId, setProjectId] = useState(null);
  const [config, setConfig] = useState({
    sheet: 'Planilha1',   
    column: 'B',           
    date_column: 'A',      
    line: 2               
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleClose = () => {
    setStep(1);
    setProjectName('');
    setFile(null);
    setProjectId(null);
    setConfig({ sheet: 'Planilha1', column: 'B', date_column: 'A', line: 2 });
    setErrorMessage('');
    onClose();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!projectName || !file) return;

    setLoading(true);
    setErrorMessage(''); 

    try {
      const response = await projectService.upload(projectName, file);
      setProjectId(response.data.project.ID);
      setStep(2); 
    } catch (error) {
      console.error("Erro no upload", error);
      setErrorMessage(error.response?.data?.error || "Erro ao enviar arquivo.");
    } finally {
      if(step === 1) setLoading(false);
    }
  };

  const handleConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await projectService.updateSettings(projectId, {
        ...config,
        line: parseInt(config.line)
      });
      
      onSuccess(); 
      handleClose(); 
    } catch (error) {
      console.error("Erro na configuração", error);
      setErrorMessage("Erro ao salvar configurações. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {step === 1 ? (
          <form onSubmit={handleUpload}>
            <div className="modal-header">
              <h2>Novo Projeto</h2>
              <p>Passo 1/2: Importe sua planilha (Excel).</p>
            </div>

            <div className="format-guide">
                <p className="guide-title">💡 Como preparar sua planilha:</p>
                <div className="mini-excel">
                    <div className="excel-header">
                        <span>A (Data)</span>
                        <span>B (Valor)</span>
                        <span>C (Desc)</span>
                    </div>
                    <div className="excel-row">
                        <span>01/01/2026</span>
                        <span className="negative">-150,00</span>
                        <span className="text-muted">Luz</span>
                    </div>
                    <div className="excel-row">
                        <span>05/01/2026</span>
                        <span className="positive">5.000,00</span>
                        <span className="text-muted">Venda</span>
                    </div>
                </div>
                <ul className="guide-tips">
                    <li>Coluna de <strong>Data</strong> é obrigatória.</li>
                    <li>Use <strong>negativo (-)</strong> para gastos.</li>
                </ul>
            </div>

            <Alert 
               type="error" 
               message={errorMessage} 
               onClose={() => setErrorMessage('')}
            />

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>Nome do Projeto</label>
              <input 
                type="text" 
                placeholder="Ex: Fluxo de Caixa 2026" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>

            {!file ? (
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input id="file-input" type="file" hidden accept=".xlsx, .xls"
                  onChange={(e) => setFile(e.target.files[0])} 
                />
                <span style={{fontSize: '28px'}}>📂</span>
                <p style={{color: 'var(--text-secondary)'}}>
                  <span style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Clique para enviar</span> ou arraste
                </p>
              </div>
            ) : (
              <div className="file-info">
                <span>{file.name}</span>
                <button type="button" onClick={() => setFile(null)} style={{border:'none', background:'transparent', color:'#E31A1A', cursor:'pointer'}}>✕</button>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Próximo >'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfig}>
            <div className="modal-header">
              <h2>Mapear Dados</h2>
              <p>Passo 2/2: Onde estão os dados no seu Excel?</p>
            </div>

            <Alert 
               type="error" 
               message={errorMessage} 
               onClose={() => setErrorMessage('')}
            />

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>Nome da Aba (Sheet)</label>
              <input 
                type="text" 
                placeholder="Ex: Planilha1" 
                value={config.sheet}
                onChange={(e) => setConfig({...config, sheet: e.target.value})}
                required
              />
              <small style={{color: '#A3AED0', fontSize: '11px'}}>Geralmente "Planilha1" ou "Sheet1"</small>
            </div>

            <div style={{display: 'flex', gap: '15px'}}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Coluna de Valor</label>
                <input 
                  type="text" 
                  placeholder="Ex: B" 
                  value={config.column}
                  onChange={(e) => setConfig({...config, column: e.target.value})}
                  required
                />
                <small style={{color: '#05CD99', fontSize: '11px'}}>Valores (+) e (-)</small>
              </div>
              
              <div className="input-group" style={{ flex: 1 }}>
                <label>Coluna de Data</label>
                <input 
                  type="text" 
                  placeholder="Ex: A" 
                  value={config.date_column}
                  onChange={(e) => setConfig({...config, date_column: e.target.value})}
                />
                <small style={{color: '#05CD99', fontSize: '11px'}}>Obrigatório p/ Runway</small>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: '15px' }}>
              <label>Linha de Início</label>
              <input 
                type="number" 
                value={config.line}
                onChange={(e) => setConfig({...config, line: e.target.value})}
                required
              />
              <small style={{color: '#A3AED0', fontSize: '11px'}}>Linha onde começam os dados reais (pule o cabeçalho)</small>
            </div>

            <div className="modal-actions" style={{ marginTop: '25px' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%'}}>
                {loading ? 'Calculando...' : 'Concluir e Analisar'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default UploadModal;
