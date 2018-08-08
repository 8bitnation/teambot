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

    static get relationMappings() {
        const User = require('./user')
        const Event = require('./event')

        return {
            events: {
                relation: Model.HasManyRelation,
                modelClass: Event,
                join: {
                    from: 'platform.id',
                    to: 'event.platform_id'
                }
            },
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'platform.id',
                    through: {
                        from: 'platform_user.platform_id',
                        to: 'platform_user.user_id',
                    },
                    to: 'user.id'
                }
            },
        }
    }
}

module.exports = Platform