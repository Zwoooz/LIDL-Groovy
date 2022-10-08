const chalk = require('chalk');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(chalk.green('Ready!\nLogged in as', chalk.cyan(client.user.tag)));
  },
};
