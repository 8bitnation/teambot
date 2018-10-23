'use strict'
/* eslint-disable no-magic-numbers */
exports.up = async function(knex) {
    await knex.schema.createTable('platform', function (t) {
        t.string('id').primary().notNullable()
        t.string('role_id')
        t.timestamp('created_at').defaultTo(new Date().toISOString())
        t.timestamp('updated_at').defaultTo(new Date().toISOString())
        t.string('name').notNullable()
        t.string('colour')
        t.string('image', 1024)
    })

    return knex('platform').insert([
        { id: 'PC', name: 'PC', image: '/img/platform-win7.png' },
        { id: 'PS', name: 'Playstation', image: '/img/platform-ps.png' },
        { id: 'XB', name: 'Xbox', image: '/img/platform-xb.png' },
        { id: 'N', name: 'Nintendo', image: '/img/platform-n.png' }
    ])
}

exports.down = function(knex) {
    return knex.schema.dropTable('platform')
}