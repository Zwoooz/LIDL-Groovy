const{ SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const{ Table } = require('embed-table');

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
    await interaction.deferReply();
    const charName = interaction.options.getString('character').toLowerCase();
    let serverName = interaction.options.getString('realm').toLowerCase();
    if(serverName.includes(' ') || serverName.includes('-')) {
      serverName = serverName.replace(/-| /g, '');
    }
    const region = interaction.options.getString('region').toLowerCase();

    function fillMissingElements(arr1, arr2) {
      const filledArr1 = [];
      const filledArr2 = [];
      let i = 0;
      let j = 0;

      while(i < arr1.length || j < arr2.length) {
        const arr1Split = (i < arr1.length) ? arr1[i].split(' ') : null;
        const arr2Split = (j < arr2.length) ? arr2[j].split(' ') : null;

        if(arr1Split && (arr2Split === null || arr1Split[0] < arr2Split[0])) {
          filledArr1.push(arr1[i]);
          filledArr2.push('');
          i += 1;
        } else if(arr2Split && (arr1Split === null || arr2Split[0] < arr1Split[0])) {
          filledArr1.push('');
          filledArr2.push(arr2[j]);
          j += 1;
        } else{
          filledArr1.push(arr1[i]);
          filledArr2.push(arr2[j]);
          i += 1;
          j += 1;
        }
      }

      return[filledArr1, filledArr2];
    }
    // chatgpt probably shit solution cause I was lazy and short on time

    const mPlus = async (name, nameServer, nameRegion) => {
      const res = await fetch(
        `https://raider.io/api/v1/characters/profile?region=${nameRegion}&realm=${nameServer}&name=${name}&fields=mythic_plus_scores`,
      );
      const userScore = await res.json();

      if(userScore.message) {
        if(userScore.message.includes('realm')) return interaction.editReply(`${nameServer} is not a valid realm`);
        if(userScore.message.includes('character')) return interaction.editReply(`${name} is not a valid character`);
      }

      const userDungeonsBest = await fetch(
        `https://raider.io/api/v1/characters/profile?region=${nameRegion}&realm=${nameServer}&name=${name}&fields=mythic_plus_best_runs`,
      );
      const userDungeonsBestJSON = await userDungeonsBest.json();

      const userDungeonsAlternate = await fetch(
        `https://raider.io/api/v1/characters/profile?region=${nameRegion}&realm=${nameServer}&name=${name}&fields=mythic_plus_alternate_runs`,
      );
      const userDungeonsAlternateJSON = await userDungeonsAlternate.json();

      const tyr = [];
      const fort = [];
      // eslint-disable-next-line max-len
      userDungeonsBestJSON.mythic_plus_best_runs.concat(userDungeonsAlternateJSON.mythic_plus_alternate_runs).forEach((element) => {
        if(element.affixes[0].name === 'Tyrannical') tyr.push(`${element.short_name} +${element.mythic_level}${element.num_keystone_upgrades === 0 ? ' (OT)' : ''}`);
        else fort.push(`${element.short_name} +${element.mythic_level}${element.num_keystone_upgrades === 0 ? ' (OT)' : ''}`);
      });
      tyr.sort();
      fort.sort();

      const[tyrFilled, fortFilled] = fillMissingElements(tyr, fort);

      const mPlusEmbed = new EmbedBuilder()
        .setColor('9B59B6')
        .setTitle(`Profile of ${charName.charAt(0).toUpperCase() + charName.slice(1)}`)
        .setURL(`https://raider.io/characters/${nameRegion}/${nameServer}/${name}`)
        .setThumbnail(userScore.thumbnail_url)
        .addFields(
          {
            name: 'Mythic+ Score:',
            value: `**${userScore.mythic_plus_scores.all}**`,
            inline: true,
          },
          { name: '\u200b', value: '**Best runs:**' },
        );

      const table = new Table({
        titles: ['Tyrannical', 'Fortified'],
        titleIndexes: [0, 30],
        columnIndexes: [0, 19],
        start: '`',
        end: '`',
        padEnd: 3,
      });
      for(let i = 0; i <= tyrFilled.length - 1; i += 1) {
        table.addRow([tyrFilled[i], fortFilled[i]], { override: 13 });
      }

      mPlusEmbed.addFields(table.toField());

      return interaction.editReply({ embeds: [mPlusEmbed] });
    };
    mPlus(charName, serverName, region);
  },
};
