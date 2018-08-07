'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('group_user', function (t) {
        t.increments().primary()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.string('group_id').notNullable()
        t.string('user_id').notNullable()
        t.foreign('group_id').references('id').inTable('group')
        t.foreign('user_id').references('id').inTable('user')
        t.index(['group_id', 'user_id'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('group_user')
}
