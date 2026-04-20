import axios from 'axios'

function forceLogout() {
  localStorage.removeItem('userToken')
  localStorage.removeItem('userName')
  localStorage.removeItem('userRole')
  window.location.href = '/'
}

// Attach token to every request automatically
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Catch 401 on any response → force logout
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      forceLogout()
    }
    return Promise.reject(error)
  }
)
