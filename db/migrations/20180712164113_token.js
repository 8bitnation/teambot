'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('token', function (t) {
        t.string('id').primary().notNullable()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.string('user_id').notNullable().index()
        t.string('group_id').nullable()
        t.string('message_id')
        t.foreign('user_id').references('id').inTable('user')
        t.foreign('group_id').references('id').inTable('group')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('token')
}