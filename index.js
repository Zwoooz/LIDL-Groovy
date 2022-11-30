/* eslint-disable */
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Player } = require('discord-player');
const { token, youTubeCookie } = require('./config.json');
const { setTimeout } = require('timers/promises');




const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
  presence: {
    activities: [{
      type: 2,
      name: '/play'
    }],
  },
});

const player = new Player(client, {
  ytdlOptions: {
    filter: 'audioonly',
    highWaterMark: 1 << 30,
    dlChunkSize: 0,
    requestOptions: {
      headers: {
        cookie: youTubeCookie,
      },
    },
  },
});
module.exports = { player };

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}



let playMsg;
player.on('trackStart', async (queue, track) => {
  const nowPlayingEmbed = new EmbedBuilder()
      .setColor('Gold')
      .setTitle('Now playing:')
      .setDescription(`[**${track.toString()}**](${track.url})`)
      .setThumbnail(track.thumbnail);
  if(playMsg) {
    playMsg.delete();
    playMsg = await queue.metadata.channel.send({ embeds: [nowPlayingEmbed] })
  } else {
    playMsg = await queue.metadata.channel.send({ embeds: [nowPlayingEmbed] })
  }
})
player.on('trackAdd', (queue, track) => queue.metadata.channel.send({ content: `🎶 | Track **${track.title}** has been added to the queue!` }).then((msg) => setTimeout(3000).then(() => msg.delete())));
player.on('playlistAdd', (queue, playlist) => queue.metadata.channel.send({ content: `🎶 | Playlist **${playlist.title}** with ${playlist.items.length} songs has been added to the queue!` }).then((msg) => setTimeout(3000).then(() => msg.delete())));


client.login(token);

// supresses ExperimentalWarning
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (
    name === 'warning'
    && typeof data === 'object'
    && data.name === 'ExperimentalWarning'
    // if you want to only stop certain messages, test for the message here:
    // && data.message.includes(`Fetch API`)
  ) {
    return false;
  }
  return originalEmit.apply(process, arguments);
};
// supresses ExperimentalWarning
