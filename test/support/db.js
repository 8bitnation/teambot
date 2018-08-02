'use strict'
/* eslint-disable no-await-in-loop */

const db = require('../../app/db')
const Group = require('../../app/db/group')
const config = Object.assign({}, require('../../app/db/config'))
config.connection.filename = 'db/test.sqlite'

async function init() {

    // sanity check that we are not going to initialise the production DB
    const knex = db(config)
    if(knex.client.config.connection.filename !== config.connection.filename)
        throw new Error('not running against the test database!')

    while( (await knex.migrate.currentVersion()) !== 'none') {
        await knex.migrate.rollback()
    }
    await knex.migrate.latest()

    return knex
}

module.exports = { init, Group }

