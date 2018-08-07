'use strict'

const logger = require('./util/logger')
const Discord = require('discord.js')
const client = new Discord.Client()
const { format } = require('util')

const { Token, User, Group, Event, Platform } = require('./db')

const LFG_SUFFIX = '_lfg'

/**
 * look for every _lfg channel and add it to the possible target list
 */
async function syncRoles() {

    // we want to be able to stub these functions
    // so we need to reference them via the module.exports
    const lfg = module.exports.lfgChannels()
    const roles = module.exports.guildRoles()

    // loop through each channel and see if there is a corresponding role

    for (let l of lfg) {
        const name = l.name.slice(0, -LFG_SUFFIX.length).replace(/_/g, ' ').toLowerCase()
        // do we have a role?
        const role = roles.find( r => r.name.replace(/_/g, ' ').toLowerCase() === name )
        if(role) {
            logger.debug('synchronising channel %s / %s', l.name, name)
            // check if the channel exists in the DB

            // no need to rush
            // eslint-disable-next-line no-await-in-loop
            const group = await Group.query().findById(l.id)

            if(!group) {
                logger.info('creating group %s', name)
                // eslint-disable-next-line no-await-in-loop
                await Group.query().insert({ id: l.id, role_id: role.id, name })
            } else {
                // eslint-disable-next-line no-await-in-loop
                await group.$query().patch({ role_id: role.id })
            }

        }
    } 

    // loop through all the platforms

    const platforms = await Platform.query().select()
    for(let p of platforms) {
        // do we have a role with the same name?
        const role = roles.find( r => r.name.toLowerCase() === p.name.toLowerCase())
        if(role) {
            // update the platform role_id
            logger.debug('synchronising platform %s', p.name)
            // eslint-disable-next-line no-await-in-loop
            await p.$query().patch({ role_id: role.id })
        }
    }

}

/**
 * Return a list of roles for the guild
 * @param {*} user_id 
 */
function guildRoles() {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return []

    return guild.roles.array()
}

/**
 * return an array of channels ending with _lfg
 */
function lfgChannels() {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return []

    const lfg = guild.channels.filterArray( ch => ch.name.endsWith(LFG_SUFFIX))

    return lfg
}

/**
 * Get a list of roles for the user 
 * @param {*} user_id 
 */
async function userRoles(user_id) {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return []

    const member = await guild.fetchMember(user_id)

    if(!member) return []
    return member.roles.array()
}

/**
 * Build a list of platform id's ready for a graphUpsert
 * @param {*} user_id 
 */
async function userPlatforms(user_id) {
    const roles = await module.exports.userRoles(user_id)
    const platforms = []
    for(let r of roles) {
        // eslint-disable-next-line no-await-in-loop
        const platform = await Platform.query().first().where('role_id', r.id)
        if(platform) platforms.push({ id: platform.id })
    }
    return platforms
}

/**
 * Build a list of group id's ready for a graphUpsert
 * @param {*} user_id 
 */
async function userGroups(user_id) {
    const roles = await module.exports.userRoles(user_id)
    const groups = []
    for(let r of roles) {
        // eslint-disable-next-line no-await-in-loop
        const group = await Group.query().first().where('role_id', r.id)
        if(group) groups.push({ id: group.id })
    }
    return groups
}

async function updateEventMessage(trx, event, message) {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return logger.error('updateEventMessage: failed to find guild %s', process.env.DISCORD_GUILD)

    const channel = guild.channels.get(event.channel_id)
    if(!channel) return logger.error('updateEventMessage: failed to find channel %s', event.channel_id)

    if(event.message_id) {
        const prev_message = await channel.fetchMessage(event.message_id)
        if(prev_message) await prev_message.delete()
    }

    const new_message = await channel.sendMessage(message)

    await Event.query(trx).update({ message_id: new_message.id }).where({ id: event.id, message_id: event.message_id })

}


function sendCreateMessage(trx, event) {
    // build a message

    return updateEventMessage(trx, event, 'created event')
}

function sendJoinMessage(trx, event) {
    // build a message

    return updateEventMessage(trx, event, 'joined event')
}

function sendLeaveMessage(trx, event) {
    return updateEventMessage(trx, event, 'left event')
}


function sendDeleteMessage(trx, event) {
    return updateEventMessage(trx, event, 'deleted event')
}


/**
 * we have to be able to test this async, so we explicitly define and export it
 */
async function messageHandler(msg) {
    if(['/team', '!team'].some( cmd => msg.content.startsWith(cmd)) ) {
        // process the message
        logger.info('message received: %s %s', msg.id, msg.content)
        try {
            await msg.delete()
        } catch(err) {
            logger.error('failed to remove message: %s, %s %j', msg.id, err.message, err.stack)
        }

        // ignore anything not from a guild
        if(!msg.member || !msg.channel) return

        // try and remove any previous tokens and messages
        const tokens = await Token.query().where('user_id', msg.author.id)
        await Token.query().del().where('user_id', msg.author.id)
        for(let t of tokens) {
            try {
                if(t.message_id) {
                    // eslint-disable-next-line no-await-in-loop
                    const old_message = await msg.author.fetchMessage(t.message_id)
                    // eslint-disable-next-line no-await-in-loop
                    if(old_message) await old_message.delete()
                }
            } catch(err) {
                logger.error('something went wrong when removing old token messages for user %s, %s %j', msg.author.username, err.message, err.stack)
            }
        }

        // create everything from new
        try {
            // create the user
            const user = await User.query().upsertGraph({
                id: msg.author.id,
                name: msg.member.nickname || msg.author.username,
                groups: await userGroups(msg.author.id),
                platforms: await userPlatforms(msg.author.id)
            }, { insertMissing: true, relate: true, unrelate: true })

            // check if the group exists first
            const group = await Group.query().findById(msg.channel.id)

            // create the token
            const token = await Token.query().insert({
                user_id: user.id,
                group_id: group ? group.id : null
            })

            const message_id = await msg.author.send('Please click on the following link to use the team tool: ' + 
                process.env.HOST_URL + '/auth/' + token.id )

            // save the message_id we sent with the token URL
            if(message_id) {
                await token.$query().patch({ message_id })
            }
        } catch(err) {
            logger.error('something went wrong when dealing with message: %s, %s %j', msg.id, err.message, err.stack)
        }   

    } 
}

client.on('message', messageHandler)

function login(token) {

    const p = new Promise((resolve, reject) => {
        client.once('ready', () => {
            logger.info(`Logged in as ${client.user.tag}`)
            // if no guild is specified, get the first one
            if(!process.env.DISCORD_GUILD) {
                const g = client.guilds.first()
                process.env.DISCORD_GUILD = g.id
            }
        
            const guild = client.guilds.get(process.env.DISCORD_GUILD)
            if(!guild) {
                return reject(format('unable to find guild ID %s', process.env.DISCORD_GUILD))
            }
        
            logger.info('managing guild: %s', guild.name)
            resolve(guild)
        })
    })

    client.login(token)
    return p
}

module.exports = { 
    login, messageHandler,
    guildRoles, syncRoles, userRoles, lfgChannels,
    sendCreateMessage, sendJoinMessage,
    sendLeaveMessage, sendDeleteMessage
}