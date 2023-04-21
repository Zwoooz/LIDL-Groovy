const wait = require('node:timers/promises').setTimeout;
const{ SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips to next song.'),
  async execute(interaction) {
    const{ player } = require('../index');

    if(!player.getQueue(interaction.guild) || !player.getQueue(interaction.guild).nowPlaying()) return interaction.reply('No song currently playing!');

    interaction.reply('Skipping...');
    player.getQueue(interaction.guild).skip();
    await wait(3000);
    return interaction.deleteReply();
  },
};
