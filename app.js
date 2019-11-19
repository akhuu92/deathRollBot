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

const state = {}

bot.command('roll', (ctx) => {
  var params = ctx.message.text.split(' ')
  console.log(ctx.from)
  startGame(ctx, params)
})

bot.command('help', (ctx) => {
  ctx.reply('How to use this bot:\n- Type /roll new [num] to start a new game.\n- Type /roll after a game has started to roll.')
})

bot.command('dat', (ctx) => {
  ctx.reply("dEuH");
})

bot.launch()

function getRandomIntInclusive (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

function getName (from) {
  if (from.username) {
    return from.username
  } else {
    return from.first_name + ' ' + from.last_name
  }
}

async function startGame (ctx, params) {
  var name = getName(ctx.from)
  var chatId = ctx.message.chat.id

  if (params.length > 1) {
    if (params[1] === 'new') {
      state[chatId] = {
        playing: false,
        lastRoll: MAX
      }

      if (params[2]) {
        var newValue = Number.parseInt(params[2])
        if (Number.isNaN(newValue) || newValue > Number.MAX_VALUE || newValue < 0) {
          ctx.reply(`Please roll a valid positive number, defaulting to ${MAX}.`)
          newValue = MAX
        }
        state[chatId].lastRoll = newValue
      } else {
        state[chatId].lastRoll = MAX
      }

      state[chatId].playing = true
      await ctx.reply(`${name} started a new Death Roll.`)
    }
  }

  if (!state[chatId].playing) {
    ctx.reply('Please use /roll new [num] for a new game')
  } else {
    const lastRoll = state[chatId].lastRoll
    var currentRoll = getRandomIntInclusive(MIN, lastRoll)

    if (currentRoll === 1) {
      state[chatId].playing = false
      state[chatId].lastRoll = MAX
      ctx.reply(`${name} rolled: ${currentRoll}. You lost.\n/roll new [num] for a new game.`)
    } else {
      state[chatId].lastRoll = currentRoll
      ctx.reply(`${name} rolled: ${currentRoll}`)
    }
  }
}
