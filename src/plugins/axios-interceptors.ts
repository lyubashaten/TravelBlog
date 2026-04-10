import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://travelblog.skillbox.cc/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Добавляем перехватчик для автоматической вставки токена
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ошибок авторизации
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если токен истек или недействителен
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;