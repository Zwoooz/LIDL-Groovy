/* eslint-disable no-undef, default-case */
const chalk = require('chalk');
const queue = require('../commands/queue');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if(interaction.customId) {
      if(!queue.setFields) return;
      if(typeof listNumber === 'undefined') listNumber = 0;

      switch(interaction.customId) {
        case'first':
          listNumber = 0;
          queue.setFields(0);
          break;
        case'prev':
          if(listNumber === 0) break;
          listNumber -= 1;
          queue.setFields(listNumber);
          break;
        case'next':
          listNumber += 1;
          queue.setFields(listNumber);
          break;
        case'last':
          // TODO: make "listNumber" remember which listnumber this is at.
          queue.setFields('last');
          break;
      }
      await interaction.deferReply().then(interaction.deleteReply());
      console.log(chalk.cyan(interaction.user.tag), `triggered a button in #${interaction.channel.name}`);
      return;
    }
    if(!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if(!command) return;
    try{
      await command.execute(interaction);
    } catch(error) {
      console.error(error);
      try{
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      } catch{
        console.error(error);
        await interaction.channel.send({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
    console.log(chalk.cyan(interaction.user.tag), 'triggered the command', chalk.yellow(interaction.commandName), `in #${interaction.channel.name}`);
  },
};
