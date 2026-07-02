import env from '#start/env'

export default class GitHubService {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = env.get('GITHUB_API_URL', 'https://api.github.com/users')
  }

  async getRandomUserLogin(): Promise<string> {
    const response = await fetch(this.baseUrl)

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`)
    }

    const users = (await response.json()) as { login: string }[]

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('GitHub API returned empty user list')
    }

    const randomIndex = Math.floor(Math.random() * users.length)
    return users[randomIndex].login
  }
}
