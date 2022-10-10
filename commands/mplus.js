const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mplus')
    .setDescription('Replies with Mythic+ profile')
    .addStringOption((option) => option
      .setName('region')
      .setDescription('us/eu')
      .setRequired(true)
      .addChoices({ name: 'US', value: 'us' }, { name: 'EU', value: 'eu' }))

    .addStringOption((option) => option.setName('realm').setDescription('Name of realm').setRequired(true))

    .addStringOption((option) => option.setName('character').setDescription('Name of character').setRequired(true)),

  async execute(interaction) {
    const charName = interaction.options.getString('character').toLowerCase();
    let serverName = interaction.options.getString('realm').toLowerCase();
    if (serverName.includes(' ')) {
      serverName = serverName.replace(' ', '-');
    }
    const region = interaction.options.getString('region').toLowerCase();

    const mPlus = async (name, nameServer, nameRegion) => {
      const res = await fetch(
        `https://raider.io/api/v1/characters/profile?region=${nameRegion}&realm=${nameServer}&name=${name}&fields=mythic_plus_scores`,
      );
      const user = await res.json();

      if (user.message) {
        if (user.message.includes('realm')) return interaction.reply(`${nameServer} is not a valid realm`);
        if (user.message.includes('character')) return interaction.reply(`${name} is not a valid character`);
      }

      const mPlusEmbed = new EmbedBuilder()
        .setColor('9B59B6')
        .setTitle(`Profile of ${charName.charAt(0).toUpperCase() + charName.slice(1)}`)
        .setURL(`https://raider.io/characters/${nameRegion}/${nameServer}/${name}`)
        .setThumbnail(user.thumbnail_url)
        .addFields({
          name: 'Mythic+ Score:',
          value: `**${user.mythic_plus_scores.all}**`,
          inline: true,
        });

      return interaction.reply({ embeds: [mPlusEmbed] });
    };
    mPlus(charName, serverName, region);
  },
};
