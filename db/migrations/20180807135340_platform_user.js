'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('platform_user', function (t) {
        t.increments().primary()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.string('platform_id').notNullable()
        t.string('user_id').notNullable()
        t.foreign('platform_id').references('id').inTable('platform')
        t.foreign('user_id').references('id').inTable('user')
        t.index(['platform_id', 'user_id'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('platform_user')
}