const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('affix')
    .setDescription('Replies with Mythic+ affixes for the week')
    .addStringOption((option) => option
      .setName('region')
      .setDescription('us/eu')
      .setRequired(true)
      .addChoices({ name: 'US', value: 'us' }, { name: 'EU', value: 'eu' })),

  async execute(interaction) {
    await interaction.deferReply();
    const region = interaction.options.getString('region').toLowerCase();

    const affix = async () => {
      const res = await fetch(
        `https://raider.io/api/v1/mythic-plus/affixes?region=${region}&locale=en`,
      );
      const affixes = await res.json();

      const embed = new EmbedBuilder()
        .setColor('9B59B6')
        .setTitle('Current affixes are:')
        .setDescription(affixes.title);

      return interaction.editReply({ embeds: [embed] });
    };
    affix(region);
  },
};
