import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'compras'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('comprador_github_login').notNullable()
      table
        .integer('item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('itens')
        .onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
