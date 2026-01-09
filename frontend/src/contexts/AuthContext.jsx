import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api'; // Importe a instância que criamos acima

const AuthContext = createContext();

const actionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

const initialState = {
  isAuthenticated: false,
  user: null,
  // token: null,  <-- REMOVIDO: O navegador guarda o cookie, não nós.
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 1. Ao carregar a página, perguntamos ao backend: "O cookie ainda vale?"
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Chama a rota /validate que você tem no routes.go
        const response = await api.get('/validate');
        
        // Se deu 200 OK, estamos logados
        dispatch({ 
          type: actionTypes.LOGIN_SUCCESS, 
          payload: { user: response.data.user || {} } 
        });
      } catch (error) {
        // Se der 401 ou erro, não estamos logados
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // 2. Login agora não espera token, espera apenas "OK" (200)
  const login = async (email, password) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    try {
      // O Backend define o cookie aqui
      await api.post('/login', { email, password });
      
      // Imediatamente chamamos validate para pegar os dados do usuário (nome, id)
      // pois o endpoint de login do seu Go retorna JSON vazio.
      const userResponse = await api.get('/validate');

      dispatch({ 
        type: actionTypes.LOGIN_SUCCESS, 
        payload: { user: userResponse.data.user || {} } 
      });
    } catch (error) {
      console.error(error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Email ou senha inválidos' });
    }
  };

  const logout = () => {
    // Opcional: Chamar uma rota no backend para invalidar o cookie
    // await api.post('/logout'); 
    
    // Limpa o estado no frontend
    dispatch({ type: actionTypes.LOGOUT });
    window.location.href = '/login';
  };

  // Signup segue a mesma lógica
  const signup = async (userData) => {
     dispatch({ type: actionTypes.SET_LOADING, payload: true });
     try {
       await api.post('/signup', userData);
       // Após cadastro, você pode logar direto ou mandar para login
       // Vamos assumir que precisa logar:
       dispatch({ type: actionTypes.SET_LOADING, payload: false });
       return true; // Retorna sucesso para o componente redirecionar
     } catch (error) {
       dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao criar conta' });
       return false;
     }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {!state.loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};