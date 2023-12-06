const qrcode = require('qrcode-terminal');
const { Client, LocalAuth,GroupChat } = require('whatsapp-web.js');
const whatsapp = require('whatsapp-web.js')
const { body, validationResult } = require('express-validator');
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

require('dotenv').config()

const client = new Client({
    puppeteer: {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']},
    authStrategy: new LocalAuth({
        clientId: "client-one"
    }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2332.15.html',
    },
});

app.use(express.json());
app.use(cors())

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
    
    const chatId = process.env.NOTIFI_ON_READY.substring(1) + "@c.us";
    console.log(chatId);
    client.sendMessage(chatId, `I'm ready`);
});

client.on('message', message => {
	if(message.body === '!ping') {
		message.reply('pong');
	}
});

client.initialize();

app.post('/monitoring-report',
    (req, res) => {
        // console.log(req.body)
        phoneNumber = process.env.PHONE_NUMBER.split(", ");
        // process.env.PHONE_NUMBER
        console.log(phoneNumber)

        try{
            phoneNumber.forEach(element => {
                console.log(element)
                const chatId = element.substring(1) + "@c.us";
                // console.log(chatId);
                // console.log(req.body);
                if (req.body.msg && req.body.heartbeat.time) {
                    client.sendMessage(chatId, `Message: ${req.body.msg}\nTime: ${req.body.heartbeat.time}`);
                }else{
                    client.sendMessage(chatId, "testing success");
                }
            });
            return res.status(200).json({
                status: "ok",
                detail: req.body
            });
        }catch(err) {
            console.log(err)
            return res.status(500).send(err)
        }
    }
)


app.post('/send_message',
    body('phone_number').notEmpty(),
    body('message').notEmpty(),
    (req, res) => {
        const result = validationResult(req);
        if (result.isEmpty()) {
            try{
                const number = req.body.phone_number;
                const text = req.body.message;
                // const chatId = number.substring(1) + "@c.us";

                // console.log(chatId)
                // send message
                number.forEach(element => {
                    const chatId = element.substring(1) + "@c.us";
                    client.sendMessage(chatId, text);
                });
                return res.status(200).json({
                    status: "ok",
                    detail : req.body
                });
            }catch(err) {
                console.log(err)
                return res.status(500).send(err)
            }
        }
        res.send({ errors: result.array() });
    }
)

app.get('/getChat',async (req,res) => {
    const groupName = 'channel kuliah'
    const chats = await client.getChats()
    const groups = chats
        .filter(chat => chat.isGroup && chat.name == groupName)
        .map(chat => {
            return {
                id: chat.id._serialized,
                name: chat.name
            }
        })
    console.log(groups)
})

app.listen(port, () => {
    console.log(`Whatsapp bot listen on ${port}`)
})
