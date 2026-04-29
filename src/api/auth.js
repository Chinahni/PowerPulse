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

const buildUrl = (path) => {
  return `${getApiBaseUrl()}${path}`
}

const getErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.message || data.error || 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}

export const registerUser = async ({ name, email, password, area_id }) => {
  const response = await fetch(buildUrl('/auth/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, area_id }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json()
}

export const loginUser = async ({ email, password }) => {
  const response = await fetch(buildUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json()
}
