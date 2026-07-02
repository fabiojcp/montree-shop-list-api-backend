import { test } from '@japa/runner'
import Item from '#models/item'
import Compra from '#models/compra'
import db from '@adonisjs/lucid/services/db'

test.group('Item Model', (group) => {
  group.each.setup(async () => {
    await db.from('compras').delete()
    await db.from('itens').delete()
  })

  test('creates an item with valid data', async ({ assert }) => {
    const item = await Item.create({ nome: 'Notebook', preco: 3500, qtd_atual: 10 })

    assert.isDefined(item.id)
    assert.equal(item.nome, 'Notebook')
    assert.equal(item.preco, 3500)
    assert.equal(item.qtd_atual, 10)
  })

  test('query returns all items', async ({ assert }) => {
    await Item.create({ nome: 'A', preco: 1, qtd_atual: 1 })
    await Item.create({ nome: 'B', preco: 2, qtd_atual: 2 })

    const items = await Item.query().orderBy('id', 'asc')
    assert.lengthOf(items, 2)
  })

  test('updates stock after query and save', async ({ assert }) => {
    const item = await Item.create({ nome: 'Stock', preco: 10, qtd_atual: 5 })

    item.qtd_atual = 3
    await item.save()

    const updated = await Item.findOrFail(item.id)
    assert.equal(updated.qtd_atual, 3)
  })
})

test.group('Compra Model', (group) => {
  group.each.setup(async () => {
    await db.from('compras').delete()
    await db.from('itens').delete()
  })

  test('creates a compra linked to an item', async ({ assert }) => {
    const item = await Item.create({ nome: 'Mouse', preco: 50, qtd_atual: 3 })
    const compra = await Compra.create({ itemId: item.id, compradorGithubLogin: 'torvalds' })

    assert.isDefined(compra.id)
    assert.equal(compra.itemId, item.id)
  })

  test('preloads item relation on compra', async ({ assert }) => {
    const item = await Item.create({ nome: 'Teclado', preco: 100, qtd_atual: 5 })
    const compra = await Compra.create({ itemId: item.id, compradorGithubLogin: 'user' })

    await compra.load('item')

    assert.isDefined(compra.item)
    assert.equal(compra.item.nome, 'Teclado')
  })

  test('query returns compras with item relation', async ({ assert }) => {
    const item = await Item.create({ nome: 'Monitor', preco: 500, qtd_atual: 2 })
    await Compra.create({ itemId: item.id, compradorGithubLogin: 'a' })
    await Compra.create({ itemId: item.id, compradorGithubLogin: 'b' })

    const compras = await Compra.query().preload('item').orderBy('id', 'asc')

    assert.lengthOf(compras, 2)
    assert.equal(compras[0].item.nome, 'Monitor')
  })

  test('stock decrement logic through model', async ({ assert }) => {
    const item = await Item.create({ nome: 'Cabo', preco: 15, qtd_atual: 2 })

    item.qtd_atual -= 1
    await item.save()
    assert.equal(item.qtd_atual, 1)

    item.qtd_atual -= 1
    await item.save()
    assert.equal(item.qtd_atual, 0)
  })

  test('handles out-of-stock condition', async ({ assert }) => {
    const item = await Item.create({ nome: 'Esgotado', preco: 5, qtd_atual: 0 })

    const fresh = await Item.findOrFail(item.id)
    assert.isAtMost(fresh.qtd_atual, 0)
  })
})
