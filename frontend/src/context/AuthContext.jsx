import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('codesync_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await API.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: userToken, ...userData } = res.data.data;
        localStorage.setItem('codesync_token', res.data.data.token);
        setToken(res.data.data.token);
        setUser(res.data.data);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, avatar) => {
    try {
      setLoading(true);
      const res = await API.post('/auth/register', { name, email, password, avatar });
      if (res.data && res.data.success) {
        localStorage.setItem('codesync_token', res.data.data.token);
        setToken(res.data.data.token);
        setUser(res.data.data);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please check details.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('codesync_token');
    setToken(null);
    setUser(null);
  };

  const updateGitHubUsername = async (githubUsername) => {
    try {
      const res = await API.post('/users/github', { githubUsername });
      if (res.data && res.data.success) {
        setUser((prev) => ({ ...prev, githubUsername }));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error updating GitHub' };
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      const res = await API.post(`/users/friends/request/${friendId}`);
      return { success: res.data?.success, message: res.data?.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Request failed' };
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const res = await API.post(`/users/friends/accept/${requestId}`);
      await fetchCurrentUser(); // Refresh friends list
      return { success: res.data?.success, message: res.data?.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Accept failed' };
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateGitHubUsername,
        sendFriendRequest,
        acceptFriendRequest,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
