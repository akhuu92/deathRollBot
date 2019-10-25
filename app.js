require('dotenv').config()
const Telegraf = require('telegraf')
const utils = require('./src/utils.js')
const BOT_TOKEN = process.env.BOT_TOKEN

if (!BOT_TOKEN) {
  throw new Error('Missing Bot API Key: (BOT_TOKEN). Please set it in ENV')
}

const bot = new Telegraf(process.env.BOT_TOKEN)
const games = {}

bot.command(['dr', 'deathroll'], (ctx) => {
  const params = utils.parseParams(ctx.message.text)
  const chatId = ctx.message.chat.id
  const player = {
    playerId: ctx.message.from.id,
    displayName: utils.getDisplayName(ctx.message.from)
  }

  utils.startGame(ctx, games, params, chatId, player)
  utils.throwDice(ctx, games, chatId, player)
})

bot.command('help', (ctx) => {
  utils.helpMenu(ctx, utils.parseParams(ctx.message.text))
})

bot.launch()
