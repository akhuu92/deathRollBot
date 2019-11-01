require('dotenv').config()

const Telegraf = require('telegraf')
const BOT_TOKEN = process.env.BOT_TOKEN
const MIN = 1
const MAX = 100

if (!BOT_TOKEN) {
  throw new Error('Missing Bot API Key: (BOT_TOKEN). Please set it in ENV')
}

const bot = new Telegraf(process.env.BOT_TOKEN)
// ctx is the context for one Telegram update, next is a function that is invoked to execute the downstream middleware.

const state = {
  playing: false,
  lastRoll: MAX
}

bot.command('roll', (ctx) => {
  var params = ctx.message.text.split(' ')
  startGame(ctx, params)
  
})

bot.command('help', (ctx) => {
  ctx.reply('How to use this bot:\n- Type /roll new [num] to start a new game.\n- Type /roll after a game has started to roll.')
})

bot.launch()

function getRandomIntInclusive (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

async function startGame (ctx, params) {
  if (params.length > 1) {
    if (params[1] === 'new') {
      if (params[2]) {
        var newValue = Number.parseInt(params[2])
        if (Number.isNaN(newValue) || newValue > Number.MAX_VALUE || newValue < 0) {
          ctx.reply(`Please roll a valid positive number, defaulting to ${MAX}.`)
          newValue = MAX
        }

        state.lastRoll = newValue
      } else {
        state.lastRoll = MAX
      }

      state.playing = true
    await ctx.reply(`${ctx.from.username} started a new Death Roll.`)
    }
  }

  if (!state.playing) {
    ctx.reply('Please use /roll new [num] for a new game')
  } else {
    const lastRoll = state.lastRoll
    var currentRoll = getRandomIntInclusive(MIN, lastRoll)

    if (currentRoll === 1) {
      state.playing = false
      state.lastRoll = MAX
      ctx.reply(`${ctx.from.username} rolled: ${currentRoll}. You lost.\n/roll new [num] for a new game.`)
    } else {
      state.lastRoll = currentRoll
      ctx.reply(`${ctx.from.username} rolled: ${currentRoll}`)
    }
  }
}