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
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 }, // Next.js 15 cache control
    })

    if (!response.ok) {
      // Get the error response body if possible
      let errorBody = null
      try {
        errorBody = await response.json()
      } catch {
        // Ignore JSON parse error
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText}\n` +
        `URL: ${url.toString()}\n` +
        `Error details: ${JSON.stringify(errorBody, null, 2)}`
      )
    }

    return response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Helper function to format dates for API (UTC date only)
function formatDateForApi(date: string | Date): string {
  if (typeof date === 'string') {
    // If it's already a date string, convert to Date first to ensure proper formatting
    date = new Date(date)
  }
  return date.toISOString().split('T')[0]
}

export const getMatches = async (
  token: string,
  filters?: {
    game?: string
    status?: string
    page?: number
    per_page?: number
    sort?: string
    since?: string
    until?: string
  }
) => {
  const params: Record<string, string> = {}

  // Always include game filter
  if (filters?.game) {
    params['filter[videogame]'] = filters.game
  }

  // Map our status values to PandaScore's status values
  if (filters?.status && filters.status !== 'all') {
    switch (filters.status) {
      case 'running':
        params['filter[status]'] = 'running'
        // For live matches, don't apply date range filter
        break
      case 'finished':
        params['filter[status]'] = 'finished'
        // For finished matches, look at past 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        params['range[begin_at]'] = `${formatDateForApi(thirtyDaysAgo)},${formatDateForApi(new Date())}`
        break
      case 'not_started':
        params['filter[status]'] = 'not_started,postponed'
        // For upcoming matches, look from today to future
        const today = formatDateForApi(new Date())
        const farFuture = '2030-12-31'
        params['range[begin_at]'] = `${today},${farFuture}`
        break
    }
  } else {
    // If no status filter, use the provided date range or default to upcoming matches
    const today = formatDateForApi(new Date())
    const farFuture = '2030-12-31'
    
    // Set the date range - either from filters or default to today onwards
    const start = filters?.since ? formatDateForApi(filters.since) : today
    const end = filters?.until ? formatDateForApi(filters.until) : farFuture
    params['range[begin_at]'] = `${start},${end}`
  }

  if (filters?.page) {
    params['page'] = filters.page.toString()
  }

  if (filters?.per_page) {
    params['per_page'] = filters.per_page.toString()
  }

  // Set default sorting
  params['sort'] = '-begin_at' // Sort by begin_at in descending order

  // Log the final URL for debugging
  console.log('API URL:', buildUrl('/matches', token, params).toString())

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

export const getGames = async (token: string) => {
    return request('/videogames', token);
};
  