import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequestIdMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const reqId = ctx.request.id()
    if (reqId) {
      ctx.response.header('X-Request-Id', reqId)
    }

    return next()
  }
}
