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

export async function updateChatConfig(chatId, config) {
  const response = await api.patch(`/api/chats/${chatId}/config`, config)
  return response.data
}

export async function uploadAttachment(chatId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post(`/api/chats/${chatId}/attachments`, formData)
  return response.data
}

export async function deleteAttachment(chatId, attachmentId) {
  const response = await api.delete(`/api/chats/${chatId}/attachments/${attachmentId}`)
  return response.data
}
