const roflArray = require('./assets/rofls');
const answerForUsers = require('./assets/answerForUsersKtoI');

require('dotenv').config();
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const DATABASE_PATH = './database/receiveMessages.json';
const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });


bot.onText(/\/rofl/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const randomNumber = Math.floor(Math.random() * roflArray.length);
  const randomRofl = roflArray[randomNumber];

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, randomRofl);
});

bot.onText(/\/ne_umnichai/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const messageForUmniki = `Нет ничего утомительнее, чем присутствовать при том, как человек демонстрирует свой ум. В особенности, если ума нет.
(С) Эрих Мария Ремарк`;

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, messageForUmniki);
});

bot.onText(/\/kto_i/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const senderUserName = msg.from.username;

  const messageForUser = answerForUsers[senderUserName];

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(
    chatId,
    messageForUser !== undefined ? messageForUser : answerForUsers['unknown']
  );
});

bot.on('document', msg => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Ммммм, домашечка, спасибо тебе 😘');
});

bot.onText(/\/receive (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderUserName = msg.from.username;
  const messageDate = new Date().toLocaleString(msg.date);
  const messageId = msg.message_id;
  const receiveMessage = match[1];
  const chatType = msg.chat.type;

  const message = {
    sender: senderUserName,
    chatType: chatType,
    date: messageDate,
    chat: chatId,
    text: receiveMessage
  };

  const oldMessages =
    fs.readFileSync(DATABASE_PATH, 'utf-8') || '[]';

  const messages = JSON.parse(oldMessages);
  messages.push(message);

  fs.writeFileSync(DATABASE_PATH, JSON.stringify(messages));

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Сообщение успешно сохранено!');
});

bot.onText(/\/show_all_received_message/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const data = fs.readFileSync(DATABASE_PATH, 'utf-8');
  const messages = JSON.parse(data);

  let sendingText = '';
  sendingText = sendingText.concat('--------------------------------');
  messages.map(message => {
    sendingText = sendingText.concat(`--------------------------------
-   Отправитель: ${message.sender}
-   ID чата: ${message.chat}
-   Тип чата: ${message.chatType}
-   Текст сообщения: ${message.text}
-   Дата сохранения: ${message.date}
--------------------------------`);
  });
  sendingText = sendingText.concat('--------------------------------');

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, sendingText);
});
