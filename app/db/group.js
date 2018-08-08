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
        const User = require('./user')

        return {
            events: {
                relation: Model.HasManyRelation,
                modelClass: Event,
                join: {
                    from: 'group.id',
                    to: 'event.group_id'
                }
            },
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'group.id',
                    through: {
                        from: 'group_user.group_id',
                        to: 'group_user.user_id',
                    },
                    to: 'user.id'
                }
            },
        }
    }
}

module.exports = Group