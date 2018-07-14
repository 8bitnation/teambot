'use strict'

const { Model } = require('objection')

class Event extends Model {
    static get tableName() {
        return 'event'
    }


    static get relationMappings() {
        const User = require('./user')
        const Group = require('./group')

        return {
            owner: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'event.owner_id',
                    to: 'user.id'
                }
            },
            group: {
                relation: Model.HasOneRelation,
                modelClass: Group,
                join: {
                    from: 'event.group_id',
                    to: 'group.id'
                }
            },
            users: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {

                    from: 'event.id',
                    through: {
                        from: 'event_user.event_id',
                        to: 'event_user.user_id'
                    },
                    to: 'user.id'
                }
            }
        }
    }
}

module.exports = Event