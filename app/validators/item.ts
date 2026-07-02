import vine from '@vinejs/vine'

export const createItemValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(1).maxLength(200),
    preco: vine.number().min(0).max(99999999.99),
    qtd_atual: vine.number().min(0).max(999999),
  })
)
