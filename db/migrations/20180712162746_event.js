'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('event', function (t) {
        t.increments()
        t.timestamps(true, true)
        t.string('name').notNullable()
        t.string('owner_id').notNullable()
        t.timestamp('starting_at')
        t.foreign('owner_id').references('id').inTable('user')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('event')
}