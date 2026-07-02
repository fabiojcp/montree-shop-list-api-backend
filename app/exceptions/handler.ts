import app from '@adonisjs/core/services/app'
import { ExceptionHandler } from '@adonisjs/core/http'
import type { HttpContext } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

interface ErrorWithMessages {
  message: string
  status?: number
  messages?: { field: string; message: string; rule: string }[]
}

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    const err = error as ErrorWithMessages

    if (err.message?.includes('GitHub API')) {
      return ctx.response.status(502).json({
        message: 'Serviço externo indisponível. Tente novamente mais tarde.',
      })
    }

    if (err.message === 'Row not found') {
      return ctx.response.status(404).json({
        message: 'Registro não encontrado.',
      })
    }

    const status = err.status ?? 500

    if (err.messages) {
      return ctx.response.status(status).json({
        message: err.message,
        errors: err.messages.map((m) => ({
          field: m.field,
          message: m.message,
          rule: m.rule,
        })),
      })
    }

    if (this.debug) {
      return ctx.response.status(status).json({
        message: err.message || 'Erro interno do servidor',
        status,
      })
    }

    return ctx.response.status(status).json({
      message: err.message || 'Erro interno do servidor',
    })
  }

  async renderStatus(_status: number): Promise<StatusPageRange | StatusPageRenderer | false> {
    return false
  }
}
