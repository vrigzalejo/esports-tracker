const BASE_URL = 'https://api.pandascore.co'

const buildUrl = (endpoint: string, token: string, params?: Record<string, string>) => {
  const url = new URL(`${BASE_URL}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  url.searchParams.append('token', token)

  return url
}

const request = async (endpoint: string, token: string, params?: Record<string, string>) => {
  const url = buildUrl(endpoint, token, params)

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Next.js 15 cache control
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export const getMatches = async (
  token: string,
  filters?: {
    game?: string
    status?: string
    page?: number
    per_page?: number
  }
) => {
  const params: Record<string, string> = {}

  if (filters?.game && filters.game !== 'all') {
    params['filter[videogame]'] = filters.game
  }

  if (filters?.status && filters.status !== 'all') {
    params['filter[status]'] = filters.status
  }

  if (filters?.page) {
    params['page'] = filters.page.toString()
  }

  if (filters?.per_page) {
    params['per_page'] = filters.per_page.toString()
  }

  return request('/matches', token, params)
}

export const getTournaments = async (
  token: string,
  filters?: {
    game?: string
    page?: number
    per_page?: number
  }
) => {
  const params: Record<string, string> = {}

  if (filters?.game && filters.game !== 'all') {
    params['filter[videogame]'] = filters.game
  }

  if (filters?.page) {
    params['page'] = filters.page.toString()
  }

  if (filters?.per_page) {
    params['per_page'] = filters.per_page.toString()
  }

  return request('/tournaments', token, params)
}

export const getTeams = async (
  token: string,
  filters?: {
    game?: string
    page?: number
    per_page?: number
  }
) => {
  const params: Record<string, string> = {}

  if (filters?.game && filters.game !== 'all') {
    params['filter[videogame]'] = filters.game
  }

  if (filters?.page) {
    params['page'] = filters.page.toString()
  }

  if (filters?.per_page) {
    params['per_page'] = filters.per_page.toString()
  }

  return request('/teams', token, params)
}
