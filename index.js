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
    try{
      playMsg.delete();
    } catch (error){
      console.log(error)
    }

    console.log('Playmessage is true?', playMsg)

    playMsg = await queue.metadata.channel.send({ embeds: [nowPlayingEmbed] })
  } else {
    console.log('playMsg is false?', playMsg);
    playMsg = await queue.metadata.channel.send({ embeds: [nowPlayingEmbed] })
  }

  await queue.metadata.channel.send({ embeds: [nowPlayingEmbed] })
})

player.on('trackAdd', (queue, track) => queue.metadata.channel.send({ content: `🎶 | Track **${track.title}** has been added to the queue!` }).then((msg) => setTimeout(3000).then(() => msg.delete())));
player.on('playlistAdd', (queue, playlist) => queue.metadata.channel.send({ content: `🎶 | Playlist **${playlist.title}** with ${playlist.items.length} songs has been added to the queue!` }).then((msg) => setTimeout(3000).then(() => msg.delete())));
player.on('queueEnd', () => {
  if(playMsg) {
    playMsg.delete();
    playMsg = false;
  }
})

player.on('connectionCreate', (queue) => {
  queue.connection.voiceConnection.on('stateChange', (oldState, newState) => {
    const oldNetworking = Reflect.get(oldState, 'networking');
    const newNetworking = Reflect.get(newState, 'networking');

    const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
      const newUdp = Reflect.get(newNetworkState, 'udp');
      clearInterval(newUdp?.keepAliveInterval);
    }

    oldNetworking?.off('stateChange', networkStateChangeHandler);
    newNetworking?.on('stateChange', networkStateChangeHandler);
  });
});

client.login(token);
