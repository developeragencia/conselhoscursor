import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  firstName: string; // Compatibilidade
  lastName: string;  // Compatibilidade
  role: 'user' | 'consultor' | 'consultant' | 'admin';
  credits: number;
  profileImageUrl?: string;
  phone?: string;
  cpf?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
    isAuthenticated: false
  });

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        });
        return;
      }

      try {
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user || data;
          
          // Normalizar campos para compatibilidade
          const normalizedUser = {
            ...user,
            firstName: user.firstName || user.first_name,
            lastName: user.lastName || user.last_name,
            first_name: user.first_name || user.firstName,
            last_name: user.last_name || user.lastName
          };
          
          setAuthState({
            user: normalizedUser,
            token,
            isLoading: false,
            isAuthenticated: true
          });
        } else {
          // Token inválido
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer login');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);

      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer login'
      };
    }
  }, []);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    cpf: string;
    birth_date: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
          headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao fazer cadastro');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);

      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true
      });

      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer cadastro'
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    });
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null
    }));
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    register,
    logout,
    updateUser
  };
};
