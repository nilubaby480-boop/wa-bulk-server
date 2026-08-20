const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const app = express();
app.use(express.json());
app.use(cors());

let sock;

// WhatsApp Web Connection Setup
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('WhatsApp Connected Successfully!');
        }
    });
}

connectToWhatsApp();

// Automatic Sending Loop with 5-second Gap
app.post('/schedule', async (req, res) => {
    const { contacts, message } = req.body;
    res.status(200).json({ status: "success", message: "Bulk Sending Started!" });

    for (let number of contacts) {
        try {
            let formattedNumber = number.replace(/[^0-9]/g, '');
            if (!formattedNumber.startsWith('91') && formattedNumber.length === 10) {
                formattedNumber = '91' + formattedNumber;
            }
            const jid = `${formattedNumber}@s.whatsapp.net`;

            if (sock) {
                await sock.sendMessage(jid, { text: message });
                console.log(`Message sent to ${formattedNumber}`);
            }
            
            // Safe gap: 5 seconds per message
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (err) {
            console.log(`Error sending to ${number}:`, err);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
