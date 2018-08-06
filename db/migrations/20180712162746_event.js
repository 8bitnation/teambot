'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('event', function (t) {
        t.increments()
        t.timestamps(true, true)
        t.string('name').notNullable()
        t.string('group_id').notNullable()
        t.string('platform_id').notNullable()
        t.string('message_id')
        t.timestamp('when')
        t.foreign('group_id').references('id').inTable('group')
        t.foreign('platform_id').references('id').inTable('platform')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('event')
}