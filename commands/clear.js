const{ SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears the queue'),
  async execute(interaction) {
    const{ player } = require('../index');
    player.deleteQueue(interaction.guild);
    interaction.reply('Queue has been deleted!');
  },
};
