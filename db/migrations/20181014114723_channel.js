'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('channel', function (t) {
        t.string('id').primary().notNullable()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.timestamp('updated_at').defaultTo(new Date().toISOString())
        t.string('name').notNullable()
        t.string('platform_id').notNullable()
        t.string('group_id').notNullable()
        t.foreign('platform_id').references('id').inTable('platform')
        t.foreign('group_id').references('id').inTable('group')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('channel')
}