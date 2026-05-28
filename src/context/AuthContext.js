import React, { createContext, useContext, useReducer, useEffect } from 'react';
import dataApi, { setAuthToken, getAuthToken } from '../services/dataApi';
import { resetApiCheck } from '../services/patientDataService';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  SET_LOADING: 'SET_LOADING',
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const persistSession = (token, user) => {
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    resetApiCheck();
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
  };

  useEffect(() => {
    const restore = async () => {
      try {
        const token = getAuthToken();
        const cached = localStorage.getItem('user');
        if (!token || !cached) {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return;
        }
        try {
          const { user } = await dataApi.me();
          dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: user });
        } catch {
          localStorage.removeItem('user');
          setAuthToken(null);
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };
    restore();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { token, user } = await dataApi.login({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      persistSession(token, user);
      return { success: true, role: user.role };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { token, user } = await dataApi.register({
        name: userData.name,
        email: userData.email.trim(),
        password: userData.password,
        phone: userData.phone || '',
      });
      persistSession(token, user);
      return { success: true, role: user.role };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('user');
    resetApiCheck();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const isAdmin = state.user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
