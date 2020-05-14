const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
var memes;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
start();

function start() {
    fetchMemes();
    client.login(token);
}

client.removeListener('ready', () => {
    console.log('Ready!');
});

/**
 * Message is recieved
 */
client.on('message', message => {

    // get content of message
    var content = message.content;

    // content begins with the prefix and is not just the prefix
    if (content.startsWith(`${prefix}`) && content.length > 1) {

        // get rid of the prefix -> !dave becomes dave
        msg = content.replace(`${prefix}`, '');

        // see if the message is a command
        executeCommand(msg, message);
    }
});

/**
 * Checks if a message is a command
 * 
 * @param msg message to be checked
 * @param chan channel to reply in 
 */
function executeCommand(msg, rawMsg) {
    // starts with empty response

    var response;
    var chan = rawMsg.channel;
    // check msg against commands
    switch (msg) {
        case 'MW':
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
            response = 'f'
            break;

    }

    // reply with the command response
    if (response != null) {
        chan.send(response);
        rawMsg.delete();
    }
}

/**
 * Fetch the memes from the database and save in to the memes variable
 */
function fetchMemes() {
    var request = new XMLHttpRequest();
    var dest = 'http://192.168.1.83/DiscordBotAPI/api/memes';
    request.onload = function () {
        memes = JSON.parse(request.responseText);
    }
    request.open('GET', dest, false);
    request.send();
}

function getMeme() {
    var index = Math.floor(Math.random() * memes.length);
    return memes[index];
}