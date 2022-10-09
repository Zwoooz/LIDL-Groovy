const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('test shit'),
  async execute(interaction) {
    interaction.reply('newtest');
  },
};
