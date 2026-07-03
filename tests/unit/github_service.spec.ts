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

  test('getRandomUserLogin throws when API returns non-retriable error', async ({ assert }) => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async () => {
      return new Response('Forbidden', { status: 403 })
    }

    try {
      const service = new GitHubService()
      await assert.rejects(() => service.getRandomUserLogin(), 'GitHub API returned status 403')
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

  test('getRandomUserLogin retries on server error and eventually throws', async ({ assert }) => {
    const originalFetch = globalThis.fetch
    let callCount = 0

    globalThis.fetch = async () => {
      callCount++
      return new Response('Server Error', { status: 500 })
    }

    try {
      const service = new GitHubService()
      await assert.rejects(() => service.getRandomUserLogin(), 'GitHub API returned status 500')
      assert.isAtLeast(callCount, 2)
    } finally {
      globalThis.fetch = originalFetch
    }
  }).timeout(5000)
})
