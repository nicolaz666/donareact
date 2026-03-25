// src/services/AuthService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

const AuthService = {
  async login(username, password) {
    console.log('🔐 AuthService.login - Llamando al backend...');
    
    try {
      const response = await axios.post(`${API_URL}login/`, {
        username,
        password
      });
      
      console.log('📡 Respuesta del servidor:', response.data);
      
      if (response.data.access) {
        const userData = {
          access: response.data.access,
          refresh: response.data.refresh,
          user: response.data.user
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 Usuario guardado en localStorage:', userData);
        console.log('✅ Login exitoso');
        
        return response.data;
      } else {
        console.error('❌ Respuesta sin token access');
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  logout() {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      console.log('👤 No hay usuario en localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('👤 Usuario desde localStorage:', user);
      return user;
    } catch (e) {
      console.error('❌ Error parseando usuario:', e);
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated() {
    const user = this.getCurrentUser();
    const isAuth = !!user?.access;
    console.log('🔐 isAuthenticated check:', {
      hasUser: !!user,
      hasAccess: !!user?.access,
      isAuth
    });
    return isAuth;
  },

  getAccessToken() {
    const user = this.getCurrentUser();
    return user?.access || null;
  }
};

export default AuthService;