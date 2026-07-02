import { test } from '@japa/runner'
import GitHubService from '#services/github_service'

test.group('GitHubService', () => {
  test('getRandomUserLogin returns a login from GitHub API', async ({ assert }) => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify([
          { login: 'user1', id: 1 },
          { login: 'user2', id: 2 },
          { login: 'user3', id: 3 },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    try {
      const service = new GitHubService()
      const login = await service.getRandomUserLogin()

      assert.isString(login)
      assert.isTrue(['user1', 'user2', 'user3'].includes(login))
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test('getRandomUserLogin throws when API returns error status', async ({ assert }) => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => {
      return new Response('Internal Server Error', { status: 500 })
    }

    try {
      const service = new GitHubService()
      await assert.rejects(() => service.getRandomUserLogin(), 'GitHub API returned status 500')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test('getRandomUserLogin throws when API returns empty list', async ({ assert }) => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const service = new GitHubService()
      await assert.rejects(
        () => service.getRandomUserLogin(),
        'GitHub API returned empty user list'
      )
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
