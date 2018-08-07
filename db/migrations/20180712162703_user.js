'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('user', function (t) {
        t.string('id').primary().notNullable()
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.timestamp('updated_at').defaultTo(new Date().toISOString())
        t.string('name').notNullable()
        t.string('tz').nullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('user')
}
