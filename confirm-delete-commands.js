/* eslint-disable */
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, token, guildId } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
  .then(() => console.log('Successfully deleted all guild commands.'))
  .catch(console.error);

rest.put(Routes.applicationCommands(clientId), { body: [] })
  .then(() => console.log('Successfully deleted all application commands.'))
  .catch(console.error);
