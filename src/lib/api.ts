import axios from 'axios';

const API_URL = 'https://blogappbackend-one.vercel.app/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Blog APIs
export const blogAPI = {
  getAllBlogs: (page: number = 1, limit: number = 10) =>
    api.get(`/blogs?page=${page}&limit=${limit}`),
  getBlogById: (id: string) => api.get(`/blogs/${id}`),
  getUserBlogs: (userId: string) => api.get(`/blogs/user/${userId}`),
  createBlog: (data: FormData) =>
    api.post('/blogs', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateBlog: (id: string, data: FormData) =>
    api.put(`/blogs/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteBlog: (id: string) => api.delete(`/blogs/${id}`),
  repostBlog: (id: string) => api.post(`/blogs/${id}/repost`),
  likeBlog: (id: string) => api.post(`/blogs/${id}/like`),
  unlikeBlog: (id: string) => api.post(`/blogs/${id}/unlike`),
};

// AI APIs
export const aiAPI = {
  generate: (data: any) => api.post('/ai/generate', data),
};

// Profile APIs
export const profileAPI = {
  getProfile: (id: string) => api.get(`/profile/${id}`),
  updateProfile: (data: FormData) =>
    api.put('/profile/update', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
