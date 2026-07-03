import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthController {
  async index({ response }: HttpContext) {
    const start = process.hrtime()

    try {
      await db.rawQuery('SELECT 1')
    } catch {
      return response.status(503).json({
        status: 'down',
        database: 'disconnected',
      })
    }

    const [seconds, nanoseconds] = process.hrtime(start)
    const latencyMs = Math.round(seconds * 1000 + nanoseconds / 1_000_000)

    return response.json({
      status: 'up',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      latency: {
        database: `${latencyMs}ms`,
      },
    })
  }
}
