'use strict'
exports.up = function(knex) {
    return knex.schema.createTable('user', function (t) {
        t.string('id').primary()
        t.timestamps(true, true)
        t.string('name').notNullable()
        t.string('tz').nullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('user')
}
