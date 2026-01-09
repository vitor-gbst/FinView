import axios from 'axios';

// 1. Configuração do Axios (Para funcionar com Cookies do Go)
const api = axios.create({
  baseURL: 'http://localhost:3000', // Confirme se a porta é essa mesmo
  withCredentials: true,            // IMPORTANTE: Permite enviar/receber cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Serviços de Autenticação
export const authService = {
  // Login envia email/senha e o Go define o Cookie HttpOnly
  login: (email, password) => api.post('/login', { email, password }),
  
  signup: (userData) => api.post('/signup', userData),
  
  // Validate checa se o cookie de sessão ainda é válido
  validate: () => api.get('/validate'),
};

// 3. Serviços de Projetos (O que estava faltando)
export const projectService = {
  // Upload precisa de tratamento especial para FormData
  upload: (name, file) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('project_file', file); // O nome 'project_file' deve bater com o backend Go
    
    return api.post('/projects/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateSettings: (id, settings) => api.put(`/projects/${id}/settings`, settings),
  // Lista todos os projetos
  getAll: () => api.get('/projects/'),

  // Busca dados analíticos
  getAnalysis: (projectId, type = 'full_analysis') => 
    api.get(`/projects/${projectId}/analysis?type=${type}`),
};

export default api;