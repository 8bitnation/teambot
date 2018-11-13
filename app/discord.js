'use strict'

const logger = require('./util/logger')
const Discord = require('discord.js')
const client = new Discord.Client()
const { format } = require('util')

const { Token, User, Group, Platform, Channel } = require('./db')

const LFG_SUFFIX = '_lfg'

/**
 * look for every _lfg channel and add it to the possible target list
 */
async function syncRoles() {

    const lfg = await lfgChannels()
    const roles = await guildRoles()

    // loop through all the platforms
    const platforms = await Platform.query().select()
    for(let p of platforms) {
        // do we have a role with the same name?
        const role = roles.find( r => r.name === p.name)
        if(role) {
            // update the platform role_id
            logger.debug('synchronising platform %s', p.name)
            // eslint-disable-next-line no-await-in-loop
            await p.$query().patch({ role_id: role.id, colour: role.hexColor })
        }
    }

    // loop through each role and check if there is a matching channel with the
    // same name as the game
    for(let r of roles) {

        // we expect channels associated with platforms to have the following structure
        // <game>_<platform>_lfg
        
        const channels = lfg.filter( c => c.group.toLowerCase() === r.name.toLowerCase())

        if(!channels.length) continue

        // collapse the channels into a graph upsert
        const channelGraph = channels.map( c => ({
            id: c.id, platform_id: c.platform, name: c.name
        }))

        logger.debug('synchronising role [%s] to channels %j', r.name, channelGraph)

        // no need to rush
        // eslint-disable-next-line no-await-in-loop
        let group = await Group.query().findById(r.id)

        if(!group) {
            logger.info('creating group [%s]', r.name)
            // eslint-disable-next-line no-await-in-loop
            await Group.query().insertGraph({ id: r.id, name: r.name, channels: channelGraph })
        } else {
            // eslint-disable-next-line no-await-in-loop
            await Group.query().upsertGraph({ id: group.id, name: group.name, channels: channelGraph }, { insertMissing: true })
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
 * 
 * @param {*} name
 * 
 * return the platform and group name 
 */
async function parseChannel(name) {
    const platforms = await Platform.query().select()

    // first try and match a platform
    for(let p of platforms) {
        const re = new RegExp('^(.*)_' + p.id + LFG_SUFFIX + '$', 'i')
        const match = name.match(re)
        if(match) return {
            platform: p.id,
            group: match[1]
        }
    }

    const re = new RegExp('^(.*)' + LFG_SUFFIX + '$', 'i')
    const match = name.match(re)
    if(match) return {
        group: match[1]
    }

}

/**
 * return an array of channels ending with _lfg
 */
async function lfgChannels() {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return []

    const lfg = guild.channels.array().filter( 
        // do an initial filter based on the name and topic
        ch => ch.name.endsWith(LFG_SUFFIX) && ch.topic && ch.topic.match(/\/team/)
    ).map( c => ({ id: c.id, name: c.name }) )

    // lfg channels dictate the groups/games
    // so we have to pull the name to pieces to identify the group/game
    // and possibly the platform
    for(let l of lfg) {
        // eslint-disable-next-line no-await-in-loop
        const p = await parseChannel(l.name)
        if(p) {
            l.group = p.group.replace(/_/g, ' ')
            l.platform = p.platform
        }
    }

    // only return those that parsed a group/platform
    return lfg.filter( l => l.group)
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
    const roles = await userRoles(user_id)
    const platforms = await Platform.query()

    const mod = process.env.MOD_ROLE && roles.find( r => r.name === process.env.MOD_ROLE )
    const admin = await isAdmin(user_id)

    // if we are a moderator, return all the platforms
    if(mod || admin)
        return platforms.map( p => ({ id: p.id }) )

    const up = []
    for(let r of roles) {
        const platform = platforms.find( p => p.role_id === r.id)
        if(platform) up.push({ id: platform.id })
    }
    return up
}

/**
 * Build a list of group id's ready for a graphUpsert
 * @param {*} user_id 
 */
async function userGroups(user_id) {
    const roles = await userRoles(user_id)
    const platforms = await userPlatforms(user_id)
    const groups = await Group.query().eager('[channels]')

    const mod = process.env.MOD_ROLE && roles.find( r => r.name === process.env.MOD_ROLE )
    const admin = await isAdmin(user_id)

    // if we are a moderator, return all the groups
    if(mod || admin)
        return groups.map( g => ({ id: g.id }) )

    return groups.filter( g => {
        // is the group a role we belong to?
        if(!roles.find( r => r.id === g.id )) return false

        // is there a generic platform channel?
        if(g.channels.find( c => c.platform_id === null)) return true

        // look for a matching platform specific channel
        for(let c of g.channels) {
            if(platforms.find( p => p.id === c.platform_id)) return true
        }
        return false
    }).map( g => ( { id: g.id } ) )
}

/**
 * 
 */
async function isAdmin(user_id) {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return false

    const member = await guild.fetchMember(user_id)

    if(!member) return false
    return member.hasPermission('ADMINISTRATOR')
}

async function updateEventMessage(trx, event, message) {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    message.embed.addField('─', '*Time shown below is in your timezone.  Android will incorrectly show future dates as today*')
    if(!guild) return logger.error('updateEventMessage: failed to find guild %s', process.env.DISCORD_GUILD)

    const channel = guild.channels.get(event.channel_id)
    if(!channel) return logger.error('updateEventMessage: failed to find channel %s', event.channel_id)

    if(event.message_id) {
        try {
            const prev_message = await channel.fetchMessage(event.message_id)
        
            if(prev_message) {
                await prev_message.delete()
            }
        } catch(err) {
            logger.error('failed to delete old message %s, %j', event.message_id, err.stack)
        }

    }

    try {
        logger.debug('sending message %j', message)
        const new_message = await channel.send(message)
    
        await event.$query(trx).patch({ message_id: new_message.id })
    } catch(err) {
        logger.error('failed to send message %j', err.stack)
    }

}

function sendCreateMessage(trx, token, event) {
    // build a message

    const image = process.env.HOST_URL + event.platform.image

    const embed = new Discord.RichEmbed()
        .setColor(event.platform.colour)
        .setAuthor(token.user.name, image)
        .setDescription('created event | **' + event.name + '**')
        .setTimestamp(event.when)
        .setFooter('event scheduled')
    
    if(event.participants.length) {
        embed.addField(
            'Participants [' + event.participants.length + '/' + event.max_participants + ']', 
            event.participants.map( p => p.name).join('\n') + '\u200B',
            true
        )        
    }

    if(event.alternatives.length) {
        embed.addField(
            'Alternatives [' + event.alternatives.length + ']', 
            event.alternatives.map( p => p.name).join('\n') + '\u200B',
            true
        )
    }

    return updateEventMessage(trx, event, { embed })
}

function sendJoinMessage(trx, token, event) {
    // build a message
    const image = process.env.HOST_URL + event.platform.image

    const embed = new Discord.RichEmbed()
        .setColor(event.platform.colour)
        .setAuthor(token.user.name, image)
        .setDescription('joined event | **' + event.name + '**')
        .setTimestamp(event.when)
        .setFooter('event scheduled')
    
    if(event.participants.length) {
        embed.addField(
            'Participants [' + event.participants.length + '/' + event.max_participants + ']', 
            event.participants.map( p => p.name).join('\n'),
            true
        )        
    }

    if(event.alternatives.length) {
        embed.addField(
            'Alternatives [' + event.alternatives.length + ']', 
            event.alternatives.map( p => p.name).join('\n'),
            true
        )
    }
    return updateEventMessage(trx, event, { embed })
}

function sendLeaveMessage(trx, token, event) {
    const image = process.env.HOST_URL + event.platform.image

    const embed = new Discord.RichEmbed()
        .setColor(event.platform.colour)
        .setAuthor(token.user.name, image)
        .setDescription('left event | **' + event.name + '**')
        .setTimestamp(event.when)
        .setFooter('event scheduled')
    
    if(event.participants.length) {
        embed.addField(
            'Participants [' + event.participants.length + '/' + event.max_participants + ']', 
            event.participants.map( p => p.name).join('\n'),
            true
        )        
    }

    if(event.alternatives.length) {
        embed.addField(
            'Alternatives [' + event.alternatives.length + ']', 
            event.alternatives.map( p => p.name).join('\n'),
            true
        )
    }
    return updateEventMessage(trx, event, { embed })
}


function sendDeleteMessage(trx, token, event) {
    const image = process.env.HOST_URL + event.platform.image

    const embed = new Discord.RichEmbed()
        .setColor(event.platform.colour)
        .setAuthor(token.user.name, image)
        .setDescription('deleted event | **' + event.name + '**')
        .setTimestamp(event.when)
        .setFooter('event scheduled')
    
    return updateEventMessage(trx, event, { embed })

}


/**
 * we have to be able to test this async, so we explicitly define and export it
 */
async function messageHandler(msg) {
    if(['/team', '!team', '/lfg'].some( cmd => msg.content.startsWith(cmd)) ) {
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
                    const old_message = await msg.author.dmChannel.fetchMessage(t.message_id)
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
            const groups = await userGroups(msg.author.id)
            const platforms = await userPlatforms(msg.author.id)

            if(!groups || !groups.length) {
                return msg.author.send('You do not appear to belong to a valid game.  Please join one and try again')
            }

            if(!platforms || !platforms.length) {
                return msg.author.send('You do not appear to belong to a valid platform.  Please join one and try again')
            }

            const user = await User.query().upsertGraph({
                id: msg.author.id,
                name: msg.member.nickname || msg.author.username,
                groups, platforms
            }, { insertMissing: true, relate: true, unrelate: true })

            // check if the group exists first
            const channel = await Channel.query().findById(msg.channel.id)

            // create the token
            const token = await Token.query().insert({
                user_id: user.id,
                group_id: channel ? channel.group_id : null
            })

            const message = await msg.author.send('Please click on the following link to use the team tool: ' + 
                process.env.HOST_URL + '/auth/' + token.id )

            // save the message_id we sent with the token URL
            if(message && message.id) {
                await token.$query().patch({ message_id: message.id })
            }
        } catch(err) {
            logger.error('something went wrong when dealing with message: %s, %s %j', msg.id, err.message, err.stack)
        }   

    } 
}

client.on('message', messageHandler)

if(process.env.LOG_LEVEL === 'debug') client.on('debug', (msg) => logger.debug(msg))

function login(token) {

    const p = new Promise((resolve, reject) => {
        client.once('ready', () => {
            logger.info(`Logged in as ${client.user.tag}`)
            // if no guild is specified, get the first one
            if(!process.env.DISCORD_GUILD) {
                const g = client.guilds.first()
                if(!g) throw new Error('Unable to determine guild!')
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
    userGroups, userPlatforms,
    isAdmin,
    sendCreateMessage, sendJoinMessage,
    sendLeaveMessage, sendDeleteMessage,
    // for testing framework
    client
}