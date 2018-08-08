'use strict'

const { Model } = require('objection')

class Group extends Model {
    static get tableName() {
        return 'group'
    }

    async $beforeUpdate(context) {
        await super.$beforeUpdate(context)
        this.updated_at = new Date().toISOString()
    }


    static get relationMappings() {
        const Event = require('./event')

        return {
            events: {
                relation: Model.HasManyRelation,
                modelClass: Event,
                join: {
                    from: 'group.id',
                    to: 'event.group_id'
                }
            }
        }
    }
}

module.exports = Group