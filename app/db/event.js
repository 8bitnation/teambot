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
            participants: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {

                    from: 'event.id',
                    through: {
                        from: 'event_participant.event_id',
                        to: 'event_participant.user_id',
                        extra: { participant_id: 'id', joined_at: 'created_at'}
                    },
                    to: 'user.id'
                },
                filter: qb => qb.orderBy('event_participant.id')
            },
            alternatives: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {

                    from: 'event.id',
                    through: {
                        from: 'event_alternative.event_id',
                        to: 'event_alternative.user_id',
                        extra: { alternate_id: 'id', joined_at: 'created_at'}
                    },
                    to: 'user.id'
                },
                filter: qb => qb.orderBy('event_alternative.id')
            }
        }
    }
}

module.exports = Event