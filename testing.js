const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client, LegacySessionAuth } = require('whatsapp-web.js');
require('dotenv').config()

// Path where the session data will be stored
const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
    authStrategy: new LegacySessionAuth({
        session: sessionData
    })
});

// console.log(sessionData)
// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();