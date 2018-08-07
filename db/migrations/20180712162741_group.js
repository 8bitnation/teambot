'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('group', function (t) {
        t.string('id').primary().notNullable()
        t.string('role_id').notNullable().index()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.timestamp('updated_at').defaultTo(new Date().toISOString())
        t.string('name').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('group')
}