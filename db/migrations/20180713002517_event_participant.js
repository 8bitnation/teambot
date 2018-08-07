'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('event_participant', function (t) {
        t.increments().primary()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.string('user_id').notNullable()
        t.string('event_id').notNullable()
        t.foreign('user_id').references('id').inTable('user')
        t.foreign('event_id').references('id').inTable('event')
        t.index(['user_id', 'event_id'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('event_participant')
}