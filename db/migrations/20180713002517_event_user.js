'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('event_user', function (t) {
        t.timestamps(true, true)
        t.string('user_id').notNullable()
        t.string('group_id').notNullable()
        t.foreign('user_id').references('id').inTable('user')
        t.foreign('group_id').references('id').inTable('group')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('event_user')
}