import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', 
  withCredentials: true,            
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Sessão expirada ou inválida. Redirecionando...");
      
     
      if (window.location.pathname !== '/login') {
          window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);


export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  
  signup: (userData) => api.post('/signup', userData),
  
  logout: () => api.post('/logout'),
  
  validate: () => api.get('/validate'),
};

export const projectService = {
  upload: (name, file) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('project_file', file); 
    
    return api.post('/projects/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateSettings: (id, settings) => api.put(`/projects/${id}/settings`, settings),
  getAll: () => api.get('/projects/'),

  getAnalysis: (projectId, type = 'full_analysis') => 
    api.get(`/projects/${projectId}/analysis?type=${type}`),

  updateFile: (id, file) => {
    const formData = new FormData();
    formData.append('project_file', file);
    
    return api.put(`/projects/${id}/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/projects/${id}`),
};



export default api;
