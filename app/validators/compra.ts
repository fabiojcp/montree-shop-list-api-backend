import vine from '@vinejs/vine'

export const createCompraValidator = vine.compile(
  vine.object({
    item_id: vine.number().min(1),
  })
)
