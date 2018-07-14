'use strict'

const { Model } = require('objection')

class Group extends Model {
    static get tableName() {
        return 'group'
    }
}

module.exports = Group