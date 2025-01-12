import api from './api';

export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.get('/auth/logout');