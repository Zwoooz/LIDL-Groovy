const { SlashCommandBuilder } = require('discord.js');
const { setTimeout } = require('timers/promises');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song')
    .addStringOption((option) => option.setName('song')
      .setDescription('The song you want to play')
      .setRequired(true)),
  async execute(interaction) {
    const { player } = require('../index');

    if (!interaction.member.voice.channelId) return interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
    if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true });
    const query = interaction.options.getString('song');
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });

    try {
      if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch {
      queue.destroy();
      return interaction.reply({ content: 'Could not join your voice channel!', ephemeral: true });
    }

    await interaction.deferReply();
    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
    });
    let loadingMsg;
    if (!searchResult) return interaction.followUp({ content: 'No results were found!' }); // eslint-disable-next-line prefer-const
    loadingMsg = await interaction.followUp({ content: `⏱ | Loading your ${searchResult.playlist ? 'playlist' : 'track'}...` });
    // TODO: delete "loadingMsg" if it has added the track it's "loading...".
    // TODO: Temporarily it is just deleting itself after 100ms which is just stupid.
    try {
      setTimeout(100).then(() => loadingMsg.delete()); // TODO: This is what should fixed changed.
    } catch (error) {
      console.log(error);
    }
    // TODO: Please...

    // eslint-disable-next-line max-len, no-unused-expressions
    searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
    return null;
  },
};
