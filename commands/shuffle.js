const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffles queue'),
  async execute(interaction) {
    const { player } = require('../index');
    if (!player.getQueue(interaction.guild) || !player.getQueue(interaction.guild).nowPlaying()) return interaction.reply('No song currently playing!');
    const queue = player.getQueue(interaction.guild);

    queue.shuffle();
    return interaction.reply('Queue has been shuffled');
  },
};
