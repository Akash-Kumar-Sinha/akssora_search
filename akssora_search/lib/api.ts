// axiosInstance.js
import axios from 'axios'
import { AUTH_URL } from './constant'

const api = axios.create({
  baseURL: AUTH_URL,
  withCredentials: true,
})

let isRefreshing = false

api.interceptors.response.use(
  (response) => response, // ✅ success, pass through

  async (error) => {
    const original = error.config

    // If 401 and not already retried
    if (error.response?.status === 401 && !original._retry) {
      
      if (isRefreshing) return Promise.reject(error) // prevent loop
      
      original._retry = true
      isRefreshing = true

      try {
        // Hit your refresh endpoint
        await api.post('/oauth/refresh')
        console.log("Token refreshed successfully")
        isRefreshing = false

        // Retry original request with new cookie
        return api(original)

      } catch (refreshError) {
        isRefreshing = false
        // Refresh also failed → force login
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
