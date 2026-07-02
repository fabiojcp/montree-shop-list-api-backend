import type { HttpContext } from '@adonisjs/core/http'
import Item from '#models/item'
import { createItemValidator } from '#validators/item'

export default class ItensController {
  async index({ response }: HttpContext) {
    const itens = await Item.query().orderBy('id', 'asc')
    return response.json(itens)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createItemValidator)
    const item = await Item.create(payload)
    return response.status(201).json(item)
  }
}
