import type { HttpContext } from '@adonisjs/core/http'
import Item from '#models/item'
import { createItemValidator } from '#validators/item'

export default class ItensController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const itens = await Item.query().orderBy('id', 'asc').paginate(page, limit)

    return response.json({
      data: itens.all(),
      meta: {
        page: itens.currentPage,
        limit: itens.perPage,
        total: itens.total,
        lastPage: itens.lastPage,
      },
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createItemValidator)
    const item = await Item.create(payload)
    return response.status(201).json(item)
  }
}
