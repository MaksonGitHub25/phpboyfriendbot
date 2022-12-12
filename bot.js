const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '5735930962:AAFjGUCmSoiorJdnaXv0Thg4QwquFw9g8pE';
    
const bot = new TelegramBot(TOKEN, { polling: true });

const messagesAfterPin = [
    'Ех, опять дрочить',
    'Спасибо принцесе Виктории 😊',
    'Люблю Серегу ❤️',
    'Люблю физика ❤️',
    'Люблю писать код на пхп 😍',
    `Эй, цепь на мне, сыпь лавэ
Сотка тыщ на bag LV
Сотни сук хотят ко мне
Сотни сук хотят камней
Как дела? Как дела?
Это новый Cadillac
Делать деньги, делать деньги
Делать деньги, блять, вот так (окей, few)`,
    `Делаю вдох, так пахнет Dior
Я искал тебя вечность — вот идиот
Делаю вдох, так пахнет Dior
Я искал тебя вечность — вот идиот`
];

bot.onText(/Уроки на/, async function(msg) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const randomNumber = Math.floor(Math.random() * messagesAfterPin.length);
    const randomMessageAfterPin = messagesAfterPin[randomNumber];

    await bot.unpinChatMessage(chatId);
    await bot.pinChatMessage(chatId, messageId);
    await bot.sendMessage(chatId, randomMessageAfterPin);
});