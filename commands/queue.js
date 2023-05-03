const{
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays song queue'),
  async execute(interaction) {
    await interaction.deferReply();
    const{ player } = require('../index');
    if(!player.getQueue(interaction.guild) || !player.getQueue(interaction.guild).nowPlaying()) return interaction.editReply('No song currently playing!');
    const queue = player.getQueue(interaction.guild);
    const track = player.getQueue(interaction.guild).nowPlaying();

    const row = new ActionRowBuilder()
      .setComponents(
        new ButtonBuilder()
          .setCustomId('first')
          .setLabel('⏮️')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('last')
          .setLabel('⏭️')
          .setStyle(ButtonStyle.Secondary),

      );

    const queueArr = queue.toString().split('\n');
    const queueString = [];

    const queueEmbed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('Now playing:')
      .setDescription(`[**${track.toString()}**](${track.url})`)
      .setThumbnail(track.thumbnail)
      .setFields(
        { name: '\u200b', value: queue.toString().split('\n11')[0] },
      );

    if(queue.tracks.length > 10) {
      queueEmbed.addFields(
        { name: '\u200b', value: `And ${queue.tracks.length - 10} other items` },
      );
    }

    // TODO: Crashes the bot when buttons are used
    /* module.exports.setFields = (listNumber) => {
      queueString = [];
      let multiplier = listNumber;
      // TODO: make "listNumber" remember which listnumber this is at.
      if(multiplier === 'last') multiplier = Math.ceil((queueArr.length - 1) / 5 - 1);
      for(let i = 1; i <= 5 && i <= queueArr.length - 1; i += 1) {
        queueString.push(queueArr[i + 5 * multiplier]);
      }
      queueEmbed = new EmbedBuilder()
        .setColor('Gold')
        .setTitle('Now playing:')
        .setDescription(`[**${track.toString()}**](${track.url})`)
        .setThumbnail(track.thumbnail)
        .setFields({ name: '\u200b', value: `${queue.toString().split('\n')[0]}\n${queueString.join('\n')}` });

      interaction.editReply({ embeds: [queueEmbed], components: [row] });
    };
    */
    return interaction.editReply({ embeds: [queueEmbed] });
  },
};
