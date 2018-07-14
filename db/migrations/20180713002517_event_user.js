'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('event_user', function (t) {
        t.timestamps(true, true)
        t.string('user_id').notNullable()
        t.string('event_id').notNullable()
        t.foreign('user_id').references('id').inTable('user')
        t.foreign('event_id').references('id').inTable('event')
        t.index(['user_id', 'event_id'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('event_user')
}