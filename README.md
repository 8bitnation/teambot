# discord-danklebot

Discord version of DankleBot

This is still in [node.js](http://nodejs.org) as a stop-gap whilst I'm learning [go](http://golang.org)

# Installation

1. install node.js v8.11.0+

    $ wget https://nodejs.org/dist/v8.11.1/node-v8.11.1-linux-x64.tar.xz
    $ sudo tar -C /usr/local --strip-components 1 -xf node-v8.11.1-linux-x64.tar.xz 

2. git clone https://github.com/8bitnation/discord-danklebot.git
3. npm install
4. setup envionment
    - HOST_URL = https://db9c92d4.ngrok.io
    - DISCORD_TOKEN = <BOT/BUILD-AT-BOT/TOKEN>

# discord

- Create a new app here: https://discordapp.com/developer
- Convert it to a bot account
- Get the client id and follow: https://discordapp.com/oauth2/authorize?scope=bot&client_id=CLIENT_ID
- Get your token from the bot account page

# Roles and Channel setup

The bot expects the guild/server to have channels in the following format:

    [name_of_game]_lfg

Any text channel with that format (i.e. the name ends with `_lfg`) will be considered
a possible group for management by the bot, IFF there is a corresponding role without the
`_lfg` postfix.  The role may have `_` or spaces to separate words in the name. 

Some examples:

| Channel               | Role              |
| --------------------- | ----------------- |
| destiny_lfg           | Destiny           |
| rainbox_six_siege_lfg | Rainbow Six Siege |
| no_mans_sky_lfg       | No Mans Sky       |

