const { SlashCommandBuilder } = require('discord.js');
const { setTimeout } = require('timers/promises');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('test shit'),
  async execute(interaction) {
    interaction.reply('newtest');
  },
};
