const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays song queue'),
  async execute(interaction) {
    const { player } = require('../index');
    if (!player.getQueue(interaction.guild) || !player.getQueue(interaction.guild).nowPlaying()) return interaction.reply('No song currently playing!');
    const queue = player.getQueue(interaction.guild);
    const track = player.getQueue(interaction.guild).nowPlaying();

    const row = new ActionRowBuilder()
      .setComponents(
        first = new ButtonBuilder()
          .setCustomId('first')
          .setLabel('⏮️')
          .setStyle(ButtonStyle.Secondary),

        prev = new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Secondary),

        next = new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Secondary),

        last = new ButtonBuilder()
          .setCustomId('last')
          .setLabel('⏭️')
          .setStyle(ButtonStyle.Secondary),

      );

    const queueArr = queue.toString().split('\n');
    let queueString = [];

    queueEmbed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('Now playing:')
      .setDescription(`[**${track.toString()}**](${track.url})`)
      .setThumbnail(track.thumbnail)
      .setFields({ name: '\u200b', value: queue.toString().split('\n6')[0] });

    let listNumber = 0;
    module.exports.setFields = (multiplier = 0) => {
      queueString = [];
      listNumber += multiplier;
      console.log(listNumber);
      for (let i = 1; i <= 5 && i <= queueArr.length - 1; i++) {
        queueString.push(queueArr[i + 5 * listNumber]);
      }
      queueEmbed = new EmbedBuilder()
        .setColor('Gold')
        .setTitle('Now playing:')
        .setDescription(`[**${track.toString()}**](${track.url})`)
        .setThumbnail(track.thumbnail)
        .setFields({ name: '\u200b', value: `${queue.toString().split('\n')[0]}\n${queueString.join('\n')}` });

      interaction.editReply({ embeds: [queueEmbed], components: [row] });
      return console.log(queueString.join('\n'));
    };
    // console.log(setFields());

    return interaction.reply({ embeds: [queueEmbed], components: [row] });
  },
};
