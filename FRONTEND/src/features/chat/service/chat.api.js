import axios from 'axios'
import { API_BASE_URL } from '../../../config/api.config'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export async function getChats() {
  const response = await api.get('/api/chats')
  return response.data
}

export async function getMessages(chatId) {
  const response = await api.get(`/api/chats/${chatId}/messages`)
  return response.data
}

export async function deleteChat(chatId) {
  const response = await api.delete(`/api/chats/delete/${chatId}`)
  return response.data
}
