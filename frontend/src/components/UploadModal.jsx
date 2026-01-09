import React, { useState } from 'react';
import './UploadModal.css';
import { projectService } from '../services/api';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  // Estados do Passo 1 (Upload)
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Estados do Passo 2 (Configuração)
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Config
  const [projectId, setProjectId] = useState(null);
  const [config, setConfig] = useState({
    sheet: 'Planilha1',   // Nome da aba no Excel
    column: '',           // Nome da coluna de valor (Ex: Valor, Preço)
    date_column: '',      // Nome da coluna de data (Ex: Data, Dia)
    line: 2               // Linha onde começam os dados (geralmente 2, pois 1 é cabeçalho)
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // --- Funções de Drag and Drop ---
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

  // --- PASSO 1: ENVIAR ARQUIVO ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!projectName || !file) return;

    setLoading(true);
    try {
      const response = await projectService.upload(projectName, file);
      // Sucesso! O backend devolve o projeto criado.
      // Vamos salvar o ID dele e ir para o passo 2.
      setProjectId(response.data.project.ID);
      setStep(2); 
    } catch (error) {
      console.error("Erro no upload", error);
      alert("Erro ao enviar arquivo.");
      setLoading(false); // Só para loading se der erro, se der sucesso continua loading visualmente ou troca de tela
    } finally {
      if(step === 1) setLoading(false);
    }
  };

  // --- PASSO 2: CONFIGURAR COLUNAS ---
  const handleConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Precisamos converter 'line' para número inteiro
      await projectService.updateSettings(projectId, {
        ...config,
        line: parseInt(config.line)
      });
      
      // Agora sim, tudo pronto!
      onSuccess(); // Avisa o dashboard para recarregar
      handleClose(); // Reseta e fecha
    } catch (error) {
      console.error("Erro na configuração", error);
      alert("Erro ao salvar configurações. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reseta tudo ao fechar
    setStep(1);
    setProjectName('');
    setFile(null);
    setProjectId(null);
    setConfig({ sheet: 'Planilha1', column: '', date_column: '', line: 2 });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {step === 1 ? (
          /* ================= PASSO 1: UPLOAD ================= */
          <form onSubmit={handleUpload}>
            <div className="modal-header">
              <h2>Novo Projeto</h2>
              <p>Passo 1/2: Importe sua planilha (Excel).</p>
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>Nome do Projeto</label>
              <input 
                type="text" 
                placeholder="Ex: Finanças 2024" 
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
                <input id="file-input" type="file" hidden accept=".xlsx, .xls, .csv"
                  onChange={(e) => setFile(e.target.files[0])} 
                />
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
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
          /* ================= PASSO 2: CONFIGURAÇÃO ================= */
          <form onSubmit={handleConfig}>
            <div className="modal-header">
              <h2>Mapear Dados</h2>
              <p>Passo 2/2: Onde estão os dados no seu Excel?</p>
            </div>

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
                  placeholder="Ex: Valor" 
                  value={config.column}
                  onChange={(e) => setConfig({...config, column: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group" style={{ flex: 1 }}>
                <label>Coluna de Data</label>
                <input 
                  type="text" 
                  placeholder="Ex: Data" 
                  value={config.date_column}
                  onChange={(e) => setConfig({...config, date_column: e.target.value})}
                />
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
                {loading ? 'Salvando...' : 'Concluir e Analisar'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default UploadModal;