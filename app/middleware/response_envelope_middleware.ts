import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ResponseEnvelopeMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    await next()

    if (ctx.response.getStatus() >= 400) {
      return
    }

    if (ctx.response.hasLazyBody) {
      const originalSend = ctx.response.send.bind(ctx.response)

      ctx.response.send = (body: unknown, generateEtag?: boolean) => {
        const wrapped = {
          data: body,
          meta: {
            timestamp: new Date().toISOString(),
          },
        }
        return originalSend(wrapped, generateEtag)
      }
    }
  }
}
