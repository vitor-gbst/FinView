import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api'; 

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/validate');
        
        dispatch({ 
          type: actionTypes.LOGIN_SUCCESS, 
          payload: { user: response.data.user || {} } 
        });
      } catch (error) {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    try {
      await api.post('/login', { email, password });
      
      
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
    
    
    dispatch({ type: actionTypes.LOGOUT });
    window.location.href = '/login';
  };

  const signup = async (userData) => {
     dispatch({ type: actionTypes.SET_LOADING, payload: true });
     try {
       await api.post('/signup', userData);
       
       dispatch({ type: actionTypes.SET_LOADING, payload: false });
       return true; 
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