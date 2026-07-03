import env from '#start/env'

class GitHubAPIError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'GitHubAPIError'
  }
}

export default class GitHubService {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = env.get('GITHUB_API_URL', 'https://api.github.com/users')
  }

  private async fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(url)

      if (response.ok) {
        return response
      }

      if (response.status === 429 || response.status >= 500) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      }

      throw new GitHubAPIError(`GitHub API returned status ${response.status}`, response.status)
    }

    throw new Error('GitHub API unavailable after retries')
  }

  async getRandomUserLogin(): Promise<string> {
    const response = await this.fetchWithRetry(this.baseUrl)

    const users = (await response.json()) as { login: string }[]

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('GitHub API returned empty user list')
    }

    const randomIndex = Math.floor(Math.random() * users.length)
    return users[randomIndex].login
  }
}
