'use strict'
/* eslint-disable no-magic-numbers */
exports.up = async function(knex) {
    // SQLite does not support ALTER TABLE so we need to relax the foreign key constraint
    await knex.raw('PRAGMA defer_foreign_keys = true')
    await knex.schema.table('platform', function (t) {
        t.string('colour')
        t.string('image', 1024)
    })


    await knex('platform').where('id', 'PC').update('image', '/img/platform-win7.png')
    await knex('platform').where('id', 'PS').update('image', '/img/platform-ps.png')
    await knex('platform').where('id', 'XB').update('image', '/img/platform-xb.png')
    await knex('platform').where('id', 'N').update('image', '/img/platform-n.png')

}

exports.down = async function(knex) {
    await knex.raw('PRAGMA defer_foreign_keys = true')
    await knex.schema.table('platform', function(t) {
        t.dropColumn('colour')
        t.dropColumn('image')
    })
}