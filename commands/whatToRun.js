/* eslint-disable max-len */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whattorun')
    .setDescription('Replies with the best run option for the characters provided')
    .addStringOption((option) => option
      .setName('region')
      .setDescription('us/eu')
      .setRequired(true)
      .addChoices({ name: 'US', value: 'us' }, { name: 'EU', value: 'eu' }))

    .addStringOption((option) => option.setName('realm').setDescription('Name of realm').setRequired(true))

    .addStringOption((option) => option.setName('characters').setDescription('Name of characters, seperated by a space').setRequired(true))

    .addStringOption((option) => option
      .setName('affix')
      .setDescription('Fortified/Tyrannical')
      .setRequired(false)
      .addChoices({ name: 'Fortified', value: 'Fortified' }, { name: 'Tyrannical', value: 'Tyrannical' })),

  async execute(interaction) {
    const charNames = interaction.options.getString('characters').toLowerCase().split(' ');
    let serverName = interaction.options.getString('realm').toLowerCase();
    if (serverName.includes(' ') || serverName.includes('-')) {
      serverName = serverName.replace(/-| /g, '');
    }
    const region = interaction.options.getString('region').toLowerCase();

    let affix = [interaction.options.getString('affix')];

    const lowestScore = [];

    const mPlus = async (name) => {
      const resAlt = await fetch(
        `https://raider.io/api/v1/characters/profile?region=${region}&realm=${serverName}&name=${name}&fields=mythic_plus_alternate_runs:all`,
      );
      const userAlt = await resAlt.json();

      const resBest = await fetch(
        `https://raider.io/api/v1/characters/profile?region=${region}&realm=${serverName}&name=${name}&fields=mythic_plus_best_runs:all`,
      );
      const userBest = await resBest.json();
      if (!affix[0]) {
        const resAff = await fetch(
          `https://raider.io/api/v1/mythic-plus/affixes?region=${region}&locale=en`,
        );
        const temp = await resAff.json();
        affix = temp.title.split(', ');
      }

      for (let j = userAlt.mythic_plus_alternate_runs.length - 1; j >= 0; j -= 1) {
        if (userAlt.mythic_plus_alternate_runs[j].affixes[0].name === affix[0]) {
          lowestScore.push({
            score: userAlt.mythic_plus_alternate_runs[j].score,
            dungeon: userAlt.mythic_plus_alternate_runs[j].dungeon,
            level: `+${userAlt.mythic_plus_alternate_runs[j].mythic_level}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
          });
          break;
        }
        if (j === 0) {
          for (let k = userBest.mythic_plus_best_runs.length - 1; k >= 0; k -= 1) {
            if (userBest.mythic_plus_best_runs[k].affixes[0].name === affix[0]) {
              lowestScore.push({
                score: userBest.mythic_plus_best_runs[k].score,
                dungeon: userBest.mythic_plus_best_runs[k].dungeon,
                level: `+${userBest.mythic_plus_best_runs[k].mythic_level}`,
                name: name.charAt(0).toUpperCase() + name.slice(1),
              });
              break;
            }
          }
        }
      }
    };

    function findDuplicateDungeon(arrayOfObjects) {
      const dungeonMap = new Map();
      let maxCount = 0;
      let duplicateDungeon = null;

      for (let i = 0; i < arrayOfObjects.length; i += 1) {
        const { dungeon } = arrayOfObjects[i];
        const count = (dungeonMap.has(dungeon)) ? dungeonMap.get(dungeon) + 1 : 1;
        dungeonMap.set(dungeon, count);

        if (count > maxCount) {
          maxCount = count;
          duplicateDungeon = dungeon;
        }
      }

      return (maxCount > 1) ? { dungeon: duplicateDungeon, count: maxCount } : null;
    }

    const getLowestScores = async () => {
      const promises = charNames.map((name) => mPlus(name));
      await Promise.all(promises);
      return lowestScore.sort((a, b) => a.score - b.score);
    };

    getLowestScores().then((lowestScores) => {
      const embed = new EmbedBuilder()
        .setTitle(`Best dungeons to run for score with **${affix[0]}** affix:`)
        .setColor('#9B59B6');
      if (affix[0] === 'Tyrannical') {
        embed.setThumbnail('https://wow.zamimg.com/images/wow/icons/large/achievement_boss_archaedas.jpg');
      } else embed.setThumbnail('https://wow.zamimg.com/images/wow/icons/large/ability_toughness.jpg');

      if (findDuplicateDungeon(lowestScores)) {
        embed.addFields({
          name: `Most valuble dungeon is currently: \n${findDuplicateDungeon(lowestScores).dungeon}`,
          value: `**${findDuplicateDungeon(lowestScores).count}** people has this as their lowest scoring dungeon`,
        });
      } else {
        embed.addFields({
          name: `Most valuble dungeon is currently: \n**${lowestScores[0].dungeon}**`,
          value: `Lowest scoring dungeon is: \n**${lowestScores[0].name}** with **${lowestScores[0].dungeon} ${lowestScores[0].level}**`,
        });
      }

      embed.addFields({ name: '\u200b', value: '**Current lowest scores are:**' });
      lowestScores.forEach((score) => {
        embed.addFields({
          name: `${score.name}:`,
          value: `${score.dungeon} ${score.level}`,
        });
      });

      return interaction.reply({ embeds: [embed] });
    });
  },
};