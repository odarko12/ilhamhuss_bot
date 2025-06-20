const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');
const sock = makeWASocket({ auth: state });
sock.ev.on('creds.update', saveState);

let msgQueue = JSON.parse(fs.readFileSync('./msg-queue.json'));
const config = () => JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const targetList = () => JSON.parse(fs.readFileSync('./target.json', 'utf-8'));

// Saat ada pesan masuk
sock.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  if (!m.message || m.key.fromMe) return;

  const sender = m.key.remoteJid;
  if (!targetList().includes(sender)) return; // bukan target, skip

  const exist = msgQueue.find(x => x.sender === sender);
  if (!exist) {
    msgQueue.push({ sender, time: Date.now() });
    fs.writeFileSync('./msg-queue.json', JSON.stringify(msgQueue));
  }
});

// Cek per menit
setInterval(async () => {
  const now = Date.now();
  const updatedQueue = [];

  for (const entry of msgQueue) {
    if (now - entry.time >= 3600000) { // 1 jam
      await sock.sendMessage(entry.sender, { text: config().autoReplyText });
    } else {
      updatedQueue.push(entry);
    }
  }

  msgQueue = updatedQueue;
  fs.writeFileSync('./msg-queue.json', JSON.stringify(msgQueue));
}, 60000);
