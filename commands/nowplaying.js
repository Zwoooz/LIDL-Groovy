const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Displays currently playing song!'),
  async execute(interaction) {
    const { player } = require('../index');
    if (!player.getQueue(interaction.guild) || !player.getQueue(interaction.guild).nowPlaying()) return interaction.reply('No song currently playing!');
    const track = player.getQueue(interaction.guild).nowPlaying();

    const nowPlayingEmbed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('Now playing:')
      .setDescription(`[**${track.toString()}**](${track.url})`)
      .setThumbnail(track.thumbnail);

    return interaction.reply({ embeds: [nowPlayingEmbed] });
  },
};
