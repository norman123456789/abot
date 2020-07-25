const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
var memes;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var queue;
start();

/**
 * Grab the memes from the API
 * Start the bot
 */
function start() {
    fetchMemes();
    client.login(token);
}
/**
 * Notify when the bot is online
 */
client.addListener('ready', () => {
    console.log('ABOT is now online!');
});

/**
 * Message is recieved
 */
client.on('message', message => {

    // ignore bot messages, don't wantto go in to a loop
    if (message.author.bot) {
        return;
    }

    // get content of message
    var content = message.content;

    // content begins with the prefix and is not only the prefix
    if (content.startsWith(`${prefix}`) && content.length > 1) {

        // get rid of the prefix -> !dave becomes dave
        msg = content.replace(`${prefix}`, '').split(" ");

        // see if the message is a command
        executeCommand(msg, message);
    }
});

/**
 * Checks if a message is a command
 * 
 * @param msg[] message to be checked, split on white space for commands with multiple args
 * @param rawMsg message object -> get user/chan if needed
 */
function executeCommand(msg, rawMsg) {

    // starts with empty response and get the current channel
    var response;
    var chan = rawMsg.channel;

    // check msg against lowercase command triggers
    switch (msg[0]) {
        case 'mw':
            response = 'Model S12 Shotgun is trash lads';
            break;
        case 'b':
            response = 'b';
            break;
        case 'shhh':
            response = 'Shut your bitch ass up';
            break;
        case 'meme':
            response = getMeme();
            break;
        case 'nuke':
            response = 'boom';
            break;
        case 'f':
            response = 'f';
            break;
        case 'play':
            playAudio(rawMsg, msg[1]);
            break;
        case 'skip':
            skip(chan);
            break;
        case 'stop':
            response = stop();
            break;
    }

    // reply with the command response
    if (response != null) {
        chan.send(response);
    }
}

/**
 * Fetch the memes from the json file and save in to the memes array
 */
function fetchMemes() {
    const fs = require('fs');
    memes = JSON.parse(fs.readFileSync('meme_command.json'))["meme"];
}


/**
 * Fetch a random meme from the many possibilities
 */
function getMeme() {
    var index = Math.floor(Math.random() * memes.length);
    return memes[index]["possibility"];
}

/**
 * 
 * @param msg Message object to gain necessary info
 * @param url URL to be played
 */
async function playAudio(msg, url) {
    const vc = msg.member.voice.channel;

    // User is not in a voice channel
    if (!vc) {
        msg.channel.send("You're not in a voice channel you donkey");
        return;
    }

    const perms = vc.permissionsFor(msg.guild.me);

    // Bot cannot join/speak in the current voice channel
    if (!perms.has("CONNECT") || !perms.has("SPEAK")) {
        msg.channel.send("I need 'connect' and 'speak' voice channel permissions!");
        return;
    }
    try {

        // Get the song info and map in to a song object
        const songInfo = await ytdl.getInfo(url);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url,
        };

        // Music already playing, add the song to the queue
        if (queue) {
            queue.songs.push(song);
            msg.channel.send(`**${song.title}** has been added to the queue!`);
            return;
        }

        // Empty queue
        else {

            // Create the queue
            queue = {
                textChannel: msg.channel,
                voiceChannel: vc,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
            };

            // Add the song to the queue
            queue.songs.push(song);
        }

        // Get the voice channel connection
        queue.connection = await vc.join();

        // Play the song
        play(song);
    }
    catch (err) {
        console.log(err);
        msg.channel.send("Sorry, I wasn't able to play that video!");
    }
}

/**
 * Play the current song in the queue, delete the queue if there are no more songs 
 * @param song Song to be played 
 */
function play(song) {
    if (!song) {
        queue.voiceChannel.leave();
        queue = null;
        return;
    }

    const dispatcher = queue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            queue.songs.shift();
            play(queue.songs[0]);
        })
        .on("error", error => console.error(error));

    queue.textChannel.send(`Start playing: **${song.title}**`);
}

/**
 * Skip the current song in the queue, display the remaining number of songs
 * @param chan Text channel to notify user of queue status 
 */
function skip(chan) {
    if (!queue) {
        chan.send("There's nothing in the queue to skip!");
    }
    var title = queue.songs[0].title;
    queue.songs.shift();
    var remaining = (queue.songs.length == 0) ? " There is nothing left in the queue!" : ` There are **${queue.songs.length}** songs left in the queue!`;
    chan.send(`\nSkipping **${title}**, ${remaining}`);
    play(queue.songs[0]);
}

/**
 * Stop the music and empty the queue
 */
function stop(){
    if(!queue){
        return "There is no music to stop!";
    }
    queue.songs = [];
    queue.connection.dispatcher.end();
    return "Music stopped!";
}
