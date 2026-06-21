import axios from 'axios'
import { API_BASE_URL } from '../../../config/api.config'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export async function getGithubStatus() {
  const response = await api.get('/api/github/status')
  return response.data
}

export async function disconnectGithub() {
  const response = await api.post('/api/github/disconnect')
  return response.data
}

export function getGithubConnectUrl() {
  return `${API_BASE_URL}/api/github/connect`
}
