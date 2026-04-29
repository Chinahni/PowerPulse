const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL

const getApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('Missing API base URL. Add VITE_API_URL to your .env file.')
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
}

const buildUrl = (path) => `${getApiBaseUrl()}${path}`

const getToken = () => localStorage.getItem('token')

const getErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.message || data.error || 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}

const request = async (path, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  if (response.status === 204) return null
  return response.json()
}

export const getAreas = () => request('/areas')

export const getArea = (areaId) => request(`/areas/${areaId}`)

export const createReport = ({ area_id, status }) =>
  request('/reports', {
    method: 'POST',
    body: JSON.stringify({ area_id, status }),
  })

export const getReports = (areaId) => request(`/reports?area_id=${areaId}`)

export const followArea = (areaId) =>
  request('/follows', {
    method: 'POST',
    body: JSON.stringify({ area_id: areaId }),
  })

export const unfollowArea = (areaId) =>
  request(`/follows/${areaId}`, {
    method: 'DELETE',
  })

export const getFollows = () => request('/follows')

export const getNotifications = () => request('/notifications')

export const markNotificationRead = (notificationId) =>
  request(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })

export const getInsights = (areaId) => request(`/insights?area_id=${areaId}`)
