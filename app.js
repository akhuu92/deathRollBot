require('dotenv').config()
const BOT_TOKEN = process.env.BOT_TOKEN
const BOT_NAME = process.env.BOT_NAME

const Telegraf = require('telegraf')
const utils = require('./src/utils.js')

if (!BOT_TOKEN) {
  throw new Error('Missing Bot API Key in ENV: (BOT_TOKEN)')
}

if (!BOT_NAME) {
  throw new Error('Missing Bot Name in ENV: (BOT_NAME)')
}

const bot = new Telegraf(BOT_TOKEN)

const games = {}

bot.command(['dr', 'deathroll'], (ctx) => {
  const source = utils.parseMessage(ctx.message)

  utils.startGame(ctx, games, source)
  utils.throwDice(ctx, games, source)
  utils.deleteMessage(ctx, games, source, BOT_NAME)
})

bot.command('help', (ctx) => utils.helpMenu(ctx, utils.parseParams(ctx.message.text), BOT_NAME))

bot.launch()
