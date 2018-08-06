'use strict'
exports.up = async function(knex) {
    await knex.schema.createTable('platform', function (t) {
        t.string('id').primary().notNullable()
        t.timestamps(true, true)
        t.string('name').notNullable()
    })

    return knex('platform').insert([
        { id: 'PC', name: 'PC' },
        { id: 'PS', name: 'Playstation' },
        { id: 'XB', name: 'XBox' },
        { id: 'N', name: 'Nintendo' }
    ])
}

exports.down = function(knex) {
    return knex.schema.dropTable('platform')
}