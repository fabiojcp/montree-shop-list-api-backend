import vine from '@vinejs/vine'

export const createItemValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(1),
    preco: vine.number().min(0),
    qtd_atual: vine.number().min(0),
  })
)
