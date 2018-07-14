'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('event', function (t) {
        t.increments()
        t.timestamps(true, true)
        t.string('name').notNullable()
        t.string('owner_id').notNullable()
        t.string('group_id').notNullable()
        t.timestamp('when')
        t.foreign('owner_id').references('id').inTable('user')
        t.foreign('group_id').references('id').inTable('group')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('event')
}