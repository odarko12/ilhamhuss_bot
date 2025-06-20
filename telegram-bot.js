const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '7606459346:AAErWMfT0AP_QGiP4ag4ab1dPO0iGlADSiU'; // Ganti token bot kamu
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/set (.+)/, (msg, match) => {
  const newText = match[1];
  fs.writeFileSync('config.json', JSON.stringify({ autoReplyText: newText }, null, 2));
  bot.sendMessage(msg.chat.id, '✅ Pesan auto-reply berhasil diubah!');
});

bot.onText(/\/lihat/, (msg) => {
  const text = JSON.parse(fs.readFileSync('config.json')).autoReplyText;
  bot.sendMessage(msg.chat.id, `Pesan saat ini:\n\n"${text}"`);
});

// Tambah target
bot.onText(/\/addtarget (\d+)/, (msg, match) => {
  const number = match[1];
  const jid = `${number}@s.whatsapp.net`;
  const list = JSON.parse(fs.readFileSync('target.json'));

  if (!list.includes(jid)) {
    list.push(jid);
    fs.writeFileSync('target.json', JSON.stringify(list, null, 2));
    bot.sendMessage(msg.chat.id, `✅ Target ${number} berhasil ditambahkan`);
  } else {
    bot.sendMessage(msg.chat.id, `ℹ️ Nomor ${number} sudah ada`);
  }
});

// Hapus target
bot.onText(/\/removetarget (\d+)/, (msg, match) => {
  const number = match[1];
  const jid = `${number}@s.whatsapp.net`;
  let list = JSON.parse(fs.readFileSync('target.json'));

  if (list.includes(jid)) {
    list = list.filter(item => item !== jid);
    fs.writeFileSync('target.json', JSON.stringify(list, null, 2));
    bot.sendMessage(msg.chat.id, `🗑️ Target ${number} berhasil dihapus`);
  } else {
    bot.sendMessage(msg.chat.id, `⚠️ Nomor ${number} tidak ditemukan`);
  }
});

// Lihat semua target
bot.onText(/\/listtarget/, (msg) => {
  const list = JSON.parse(fs.readFileSync('target.json'));
  if (list.length === 0) return bot.sendMessage(msg.chat.id, '⚠️ Belum ada target');

  const numbers = list.map(j => j.replace('@s.whatsapp.net', '')).join('\n');
  bot.sendMessage(msg.chat.id, `📋 Target auto-reply:\n${numbers}`);
});
