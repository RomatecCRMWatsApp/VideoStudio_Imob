import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; company?: string; phone?: string }) =>
    api.post('/auth/register', data).then(r => r.data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
}

// Projects
export const projectsApi = {
  list: () => api.get('/projects').then(r => r.data),
  create: (data: any) => api.post('/projects', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then(r => r.data),
}

// Videos
export const videosApi = {
  list: () => api.get('/videos').then(r => r.data),
  get: (id: string) => api.get(`/videos/${id}`).then(r => r.data),
  create: (data: any) => api.post('/videos', data).then(r => r.data),
  delete: (id: string) => api.delete(`/videos/${id}`).then(r => r.data),
  previewPrompts: (data: any) => api.post('/videos/preview-prompts', data).then(r => r.data),
}

// Upload
export const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData()
  form.append('image', file)
  const res = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data.url
}
