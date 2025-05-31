const API_BASE_URL = 'https://api.pandascore.co'

export class PandaScoreAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    url.searchParams.append('token', this.token)
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getMatches(params: {
    page?: number
    per_page?: number
    filter?: Record<string, any>
  } = {}) {
    return this.request('/matches', {
      page: params.page?.toString() || '1',
      per_page: params.per_page?.toString() || '50',
      ...params.filter
    })
  }

  async getTournaments(params: {
    page?: number
    per_page?: number
    filter?: Record<string, any>
  } = {}) {
    return this.request('/tournaments', {
      page: params.page?.toString() || '1',
      per_page: params.per_page?.toString() || '50',
      ...params.filter
    })
  }

  async getTeams(params: {
    page?: number
    per_page?: number
    filter?: Record<string, any>
  } = {}) {
    return this.request('/teams', {
      page: params.page?.toString() || '1',
      per_page: params.per_page?.toString() || '50',
      ...params.filter
    })
  }

  async getPlayers(params: {
    page?: number
    per_page?: number
    filter?: Record<string, any>
  } = {}) {
    return this.request('/players', {
      page: params.page?.toString() || '1',
      per_page: params.per_page?.toString() || '50',
      ...params.filter
    })
  }

  async getLeagues(params: {
    page?: number
    per_page?: number
  } = {}) {
    return this.request('/leagues', {
      page: params.page?.toString() || '1',
      per_page: params.per_page?.toString() || '50'
    })
  }

  async getVideogames() {
    return this.request('/videogames')
  }
}
