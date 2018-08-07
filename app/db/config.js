'use strict'

module.exports = {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: 'db/teambot.sqlite'
    },
    migrations: {
        directory: 'db/migrations'
    },
    seeds: {
        directory: 'db/seeds'
    },
    pool: {
        afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb)
    },
    debug: process.env.KNEX_LOG_LEVEL === 'debug'
}

