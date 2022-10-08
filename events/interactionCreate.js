const chalk = require('chalk');
const queue = require('../commands/queue');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'first':
          queue.setFields(0);
          break;
        case 'prev':
          queue.setFields(-1);
          break;
        case 'next':
          queue.setFields(+1);
          break;
        case 'last':
          queue.setFields();
          break;
      }
      console.log(chalk.cyan(interaction.user.tag), `triggered a button in #${interaction.channel.name}`);
      queue.setFields(1);
      return;
    }
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
    console.log(chalk.cyan(interaction.user.tag), 'triggered the command', chalk.yellow(interaction.commandName), `in #${interaction.channel.name}`);
  },
};
