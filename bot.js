const roflArray = require('./assets/rofls');
const answerForUsers = require('./assets/answerForUsersKtoI');

require('dotenv').config();
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const DATABASE_PATH = './database/receiveMessages.json';
const VARS_PATH = './database/vars.json';
const URLS_PATH = './database/hwURLs.json';
const MEMES_FOLDER_PATH = './memes';
const TOKEN = process.env.TOKEN;

const varsData = fs.readFileSync(VARS_PATH, 'utf-8');
let { LINK_MESSAGE_ID } = JSON.parse(varsData);

const bot = new TelegramBot(TOKEN, { polling: true });

// ----------------------------------------------------------------

bot.onText(/^\/rofl/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const randomNumber = Math.floor(Math.random() * roflArray.length);
  const randomRofl = roflArray[randomNumber];

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, randomRofl);
});

bot.onText(/^\/meme/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const fileAmount = fs.readdirSync(MEMES_FOLDER_PATH).length;
  const randomNumber = Math.floor(Math.random() * (fileAmount - 1) + 1);

  bot.deleteMessage(chatId, messageId);
  bot.sendPhoto(chatId, `${MEMES_FOLDER_PATH}/${randomNumber}.jpg`);
});

bot.onText(/^\/ne_umnichai/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const messageForUmniki = `Нет ничего утомительнее, чем присутствовать при том, как человек демонстрирует свой ум. В особенности, если ума нет.
(С) Эрих Мария Ремарк`;

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, messageForUmniki);
});

bot.onText(/^\/kto_i/, msg => {
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

bot.onText(/^\/shock/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const replyMessageId = Object.hasOwn(msg, 'reply_to_message')
    ? msg.reply_to_message.message_id
    : undefined;

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Нихуя себе', {
    reply_to_message_id: replyMessageId
  });
});

bot.on('document', msg => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Ммммм, домашечка, спасибо тебе 😘');
});

// ----------------------------------------------------------------

bot.onText(/\/receive/, msg => {
  const chatId = msg.chat.id;
  const senderUserName = msg.reply_to_message.from.username;
  const messageDate = new Date().toLocaleString(msg.reply_to_message.date);
  const messageId = msg.message_id;
  const receiveMessage = msg.reply_to_message.text;
  const chatType = msg.reply_to_message.chat.type;

  console.log(Object.hasOwn(msg, 'reply_to_message'));

  if (!Object.hasOwn(msg, 'reply_to_message')) {
    bot.sendMessage(chatId, 'Бро, ты не указал сообщение для сохранения');
    return;
  }

  const message = {
    sender: senderUserName,
    chatType: chatType,
    date: messageDate,
    chat: chatId,
    text: receiveMessage
  };

  console.log(message);

  const oldMessages = fs.readFileSync(DATABASE_PATH, 'utf-8') || '[]';

  const messages = JSON.parse(oldMessages);
  messages.push(message);

  fs.writeFileSync(DATABASE_PATH, JSON.stringify(messages));

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Сообщение успешно сохранено!');
});

bot.onText(/\/receive_message (.+)/, (msg, match) => {
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

  const oldMessages = fs.readFileSync(DATABASE_PATH, 'utf-8') || '[]';

  const messages = JSON.parse(oldMessages);
  messages.push(message);

  fs.writeFileSync(DATABASE_PATH, JSON.stringify(messages));

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Сообщение успешно сохранено!');
});

bot.onText(/\/show_all_received_messages/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const data = fs.readFileSync(DATABASE_PATH, 'utf-8') || '[]';
  const messages = JSON.parse(data);

  if (messages.length === 0) {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, 'Пока что тут нету сообщений, хнык(');

    return;
  }

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

bot.onText(/\/show_all_user_messages (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const userName = match[1];

  const data = fs.readFileSync(DATABASE_PATH, 'utf-8') || '[]';
  const messages = JSON.parse(data);

  if (messages.length === 0) {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, 'Пока что тут нету сообщений, хнык(');

    return;
  }

  let sendingText = '';
  sendingText = sendingText.concat('--------------------------------');
  messages.map(message => {
    if (message.sender !== userName) return;

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

bot.onText(/\/clear_all_messages/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const data = fs.readFileSync(DATABASE_PATH, 'utf-8') || '[]';
  const messages = JSON.parse(data);

  if (messages.length === 0) {
    bot.sendMessage(chatId, 'Пока что тут нету сообщений, хнык(');
    bot.deleteMessage(chatId, messageId);

    return;
  }

  fs.writeFileSync(DATABASE_PATH, '');

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Все сообщения удалены!');
});

bot.onText(/\/clear_all_user_messages (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const userName = match[1];

  const data = fs.readFileSync(DATABASE_PATH, 'utf-8') || '[]';
  const messages = JSON.parse(data);

  if (messages.length === 0) {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, 'Пока что тут нету сообщений, хнык(');

    return;
  }

  messages.map((message, index) => {
    if (message.sender !== userName) return;

    messages.splice(index, 1);
  });

  fs.writeFileSync(DATABASE_PATH, JSON.stringify(messages));

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Сообщения от этого челика удалены!');
});

// ----------------------------------------------------------------

bot.onText(/\/setup_link_message/, async msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  if (msg.from.username !== 'Makson_w') {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(
      chatId,
      'Вы не обладаете нужными правами, чтоб сделать это, так что нэт 😒'
    );

    return;
  }

  LINK_MESSAGE_ID = messageId + 1;

  const data = fs.readFileSync(VARS_PATH, 'utf-8');
  const vars = JSON.parse(data);

  vars['LINK_MESSAGE_ID'] = LINK_MESSAGE_ID;

  fs.writeFileSync(VARS_PATH, JSON.stringify(vars));

  await bot.deleteMessage(chatId, messageId);
  await bot.sendMessage(chatId, 'Ссылки на домашки:\n', {
    disable_notification: true
  });
  await bot.sendMessage(
    chatId,
    'Сообщение для ссылок создано, не благодарите!',
    { disable_notification: true }
  );
});

bot.onText(/\/add_new_link/, async msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const replyMessage = msg.reply_to_message;

  if (!Object.hasOwn(msg, 'reply_to_message')) {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(
      chatId,
      'Ты не указал, что мне нужно сохранить, так что подумай над своим поведением'
    );

    return;
  }

  let lessonName = 'Без названия';
  if (Object.hasOwn(replyMessage, 'caption')) {
    lessonName = replyMessage.caption.slice(0, 30);
  } else if (
    !Object.hasOwn(replyMessage, 'caption') &&
    replyMessage.text !== undefined
  ) {
    lessonName = replyMessage.text.slice(0, 30);
  }

  const rawReplyMessageChatId = replyMessage.chat.id.toString();
  const replyMessageId = replyMessage.message_id;

  const replyMessageChatId = +rawReplyMessageChatId.slice(4);
  const link = `https://t.me/c/${replyMessageChatId}/${replyMessageId}`;

  const data = fs.readFileSync(URLS_PATH, 'utf-8') || '[]';
  const existHW = JSON.parse(data);

  const hw = {
    lessonName: lessonName,
    link: link
  };

  existHW.push(hw);
  fs.writeFileSync(URLS_PATH, JSON.stringify(existHW));

  let editedText = `Ссылки на дз:\n`;
  existHW.map(hw => {
    editedText = editedText.concat(
      `<a href="${hw.link}">${hw.lessonName}</a>\n`
    );
  });

  bot.editMessageText(editedText, {
    parse_mode: 'HTML',
    chat_id: chatId,
    message_id: LINK_MESSAGE_ID
  });

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Ссылка сделана, радуйтесь');
});

bot.onText(/\/delete_link/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const data = fs.readFileSync(URLS_PATH, 'utf-8') || '[]';
  const hwArray = JSON.parse(data);

  if (hwArray.length === 0) {
    bot.sendMessage(chatId, 'Нету сохраненных ссылок, не в этот раз');
    bot.deleteMessage(chatId, messageId);

    return;
  }

  const inlineKeyboard = {
    inline_keyboard: [],
    resize_keyboard: true,
    one_time_keyboard: true
  };

  hwArray.map(hw => {
    const lessonName = hw.lessonName.slice(0, 30);
    inlineKeyboard.inline_keyboard.push([
      {
        text: lessonName,
        callback_data: lessonName
      }
    ]);
  });

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Выберите какую ссылку хотите удалить', {
    reply_markup: inlineKeyboard
  });
});

bot.on('callback_query', callbackQuery => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const lessonName = callbackQuery.data;

  const data = fs.readFileSync(URLS_PATH, 'utf-8') || '[]';
  const hwArray = JSON.parse(data);

  hwArray.map((hw, index) => {
    if (hw.lessonName === lessonName) {
      hwArray.splice(index, 1);
    }
  });

  fs.writeFileSync(URLS_PATH, JSON.stringify(hwArray));

  let editedText = `Ссылки на дз:\n`;
  hwArray.map(hw => {
    editedText = editedText.concat(
      `<a href="${hw.link}">${hw.lessonName}</a>\n`
    );
  });

  bot.editMessageText(editedText, {
    parse_mode: 'HTML',
    chat_id: chatId,
    message_id: LINK_MESSAGE_ID
  });

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, `${lessonName} удален(a) из ссылок, так ему и надо`);
});

bot.onText(/\/delete_all_link/, msg => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  fs.writeFileSync(URLS_PATH, '');

  bot.editMessageText(`Ссылки на дз:\n`, {
    parse_mode: 'HTML',
    chat_id: chatId,
    message_id: LINK_MESSAGE_ID
  });

  bot.deleteMessage(chatId, messageId);
  bot.sendMessage(chatId, 'Все ссылки удалены, босс');
});
