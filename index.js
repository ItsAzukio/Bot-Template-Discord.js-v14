const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent],
    shards: "auto",
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.User,
        Partials.ThreadMember
    ]
});
const { readdirSync } = require("fs")
const moment = require("moment");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config()

client.commands = new Collection()

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const log = l => { console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`) };


//command-handler
const commands = [];
readdirSync('./slashCommands').forEach(async file => {
    const command = require(`./slashCommands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
})

client.on("ready", async (client) => {
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
    } catch (error) {
        console.error(error);
    }
    log(`Logged in as ${client.user.tag}`);
})

//event-handler
readdirSync('./events').forEach(async file => {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
})

//nodejs-events
process.on("unhandledRejection", e => {
    console.log(e)
})
process.on("uncaughtException", e => {
    console.log(e)
})
process.on("uncaughtExceptionMonitor", e => {
    console.log(e)
})
//

client.login(process.env.TOKEN);
