import axios from 'axios';

// Em desenvolvimento local com Docker, usa /api (proxy nginx)
// Em produção, usa a URL do backend
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    // Busca o token do localStorage (ou de onde estiver armazenado)
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro retornado pelo servidor
      console.error('Erro da API:', error.response.data);
      
      // Se for 401, redireciona para login
      if (error.response.status === 401) {
        localStorage.removeItem('access_token');
        // Redirecionar apenas se não estiver na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Requisição feita mas sem resposta
      console.error('Sem resposta do servidor');
    } else {
      // Erro na configuração da requisição
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;