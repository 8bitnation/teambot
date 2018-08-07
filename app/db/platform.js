'use strict'

const { Model } = require('objection')

class Platform extends Model {
    static get tableName() {
        return 'platform'
    }

    async $beforeUpdate(context) {
        await super.$beforeUpdate(context)
        this.updated_at = new Date().toISOString()
    }
}

module.exports = Platform