'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('event', function (t) {
        t.increments().primary()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.timestamp('updated_at').defaultTo(new Date().toISOString())
        t.string('name').notNullable()
        t.string('group_id').notNullable()
        t.string('platform_id').notNullable()
        t.integer('max_participants').notNullable()
        t.string('channel_id').notNullable()
        t.string('message_id')
        t.timestamp('when').notNullable()
        t.foreign('group_id').references('id').inTable('group')
        t.foreign('platform_id').references('id').inTable('platform')
        t.foreign('channel_id').references('id').inTable('channel')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('event')
}