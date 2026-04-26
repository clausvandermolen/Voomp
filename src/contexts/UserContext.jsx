import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(undefined);

export const UserProvider = ({ children, fetchCurrentUser }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentUser = fetchCurrentUser
          ? await fetchCurrentUser()
          : await defaultFetchCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (err) {
        if (!cancelled) {
          setError('No se pudo cargar la sesión del usuario.');
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      setError(null);
      try {
        const token = await apiLogin(credentials);
        localStorage.setItem('auth_token', token);
        const currentUser = fetchCurrentUser
          ? await fetchCurrentUser()
          : await defaultFetchCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError('Credenciales inválidas. Intente nuevamente.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCurrentUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setError(null);
  }, []);

  const contextValue = {
    user,
    isAuthenticated: user !== null,
    loading,
    error,
    login,
    logout,
    clearError,
    setUser,
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
}

async function defaultFetchCurrentUser() {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No hay sesión activa');

  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Error al obtener el perfil del usuario');
  }
  return response.json();
}

async function apiLogin(credentials) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error('Error en la autenticación');
  }
  const data = await response.json();
  return data.token;
}
