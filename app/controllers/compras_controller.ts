import type { HttpContext } from '@adonisjs/core/http'
import Item from '#models/item'
import Compra from '#models/compra'
import { createCompraValidator } from '#validators/compra'
import GitHubService from '#services/github_service'

export default class ComprasController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const compras = await Compra.query().preload('item').orderBy('id', 'asc').paginate(page, limit)

    return response.json({
      data: compras.all(),
      meta: {
        page: compras.currentPage,
        limit: compras.perPage,
        total: compras.total,
        lastPage: compras.lastPage,
      },
    })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCompraValidator)
    const item = await Item.findOrFail(payload.item_id)

    if (item.qtd_atual <= 0) {
      return response.status(400).json({
        message: 'Item fora de estoque',
        item_id: item.id,
        qtd_atual: item.qtd_atual,
      })
    }

    const githubService = new GitHubService()
    const compradorLogin = await githubService.getRandomUserLogin()

    item.qtd_atual -= 1
    await item.save()

    const compra = await Compra.create({
      itemId: item.id,
      compradorGithubLogin: compradorLogin,
    })

    await compra.load('item')

    return response.status(201).json(compra)
  }
}
