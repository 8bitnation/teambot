'use strict'
exports.up = async function(knex) {
    await knex.schema.createTable('platform', function (t) {
        t.string('id').primary().notNullable()
        t.string('role_id')
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.timestamp('updated_at').defaultTo(new Date().toISOString())
        t.string('name').notNullable()
    })

    return knex('platform').insert([
        { id: 'PC', name: 'PC' },
        { id: 'PS', name: 'Playstation' },
        { id: 'XB', name: 'Xbox' },
        { id: 'N', name: 'Nintendo' }
    ])
}

exports.down = function(knex) {
    return knex.schema.dropTable('platform')
}