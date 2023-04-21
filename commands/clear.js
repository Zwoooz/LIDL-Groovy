const{ SlashCommandBuilder } = require('discord.js');
const{ setTimeout } = require('timers/promises');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears the queue'),
  async execute(interaction) {
    const{ player } = require('../index');
    player.deleteQueue(interaction.guild);
    interaction.reply('Queue has been deleted!').then((msg) => setTimeout(5000).then(() => msg.deleteReply()));
  },
};
