require('dotenv').config()

const Telegraf = require('telegraf')
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw "Missing Bot API Key: (BOT_TOKEN). Please set it in ENV";
}

const bot = new Telegraf(process.env.BOT_TOKEN)



bot.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log('Response time: %sms', ms)
})

bot.on('text', (ctx) => ctx.reply('Hello World'))
bot.launch()