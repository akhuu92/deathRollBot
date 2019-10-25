require('dotenv').config()

const Telegraf = require('telegraf')
const session = require('telegraf/session')
const utils = require('./src/util.js')

const BOT_TOKEN = process.env.BOT_TOKEN

if (!BOT_TOKEN) {
  throw new Error('Missing Bot API Key: (BOT_TOKEN). Please set it in ENV')
}

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())

bot.command(['dr', 'deathroll'], (ctx) => {
  const params = utils.parseParams(ctx.message.text)
  const chatId = ctx.message.chat.id
  const player = {
    'playerId': ctx.message.from.id,
    'displayName': utils.getDisplayName(ctx.message.from)
  }

  utils.startGame(ctx, params, chatId, player)

  if (ctx.session.game.isPlaying) {
    utils.throwDice(ctx, player)
  } else {
    ctx.replyWithHTML(`Use <code>/dr new [num]</code> for new ☠🎲`)
  }
})

bot.launch()
