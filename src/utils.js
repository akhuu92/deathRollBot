var _ = require('lodash')

const MIN = 1
const MAX = 9999

async function throwDice (ctx, games, chatId, player) {
  if (!_.isUndefined(games[chatId].lastPlayer) && player.playerId === games[chatId].lastPlayer.playerId) {
    await ctx.replyWithHTML(`<b>${player.displayName}</b> already rolled, waiting for other players`)
    return
  }

  games[chatId].lastPlayer = player
  games[chatId].rolls++

  const roll = _.random(MIN, games[chatId].maxRoll)

  await ctx.replyWithHTML(`<b>${player.displayName}</b> rolls <b>${roll}</b>  <i>(${MIN} - ${games[chatId].maxRoll})</i>`)

  if (roll === 1) {
    games[chatId].isPlaying = false
    await ctx.replyWithHTML(`<b>${player.displayName}</b> ☠☠☠ in ${games[chatId].rolls} rolls!`)
  } else {
    games[chatId].maxRoll = roll
  }
}

async function startGame (ctx, games, params, chatId, player) {
  let newMaxRoll
  let newGame = false

  if (params.length >= 1) {
    if (_.toLower(params[0]) === 'new') {
      newGame = true

      if (params[1]) {
        newMaxRoll = _.clamp(_.toInteger(params[1]), MIN, MAX)
      } else {
        newMaxRoll = MAX
      }
    }
  }

  if (_.isUndefined(games[chatId])) {
    games[chatId] = {
      chatId: chatId,
      isPlaying: false,
      rolls: 0,
      maxRoll: MAX
    }
  }

  if (newGame) {
    games[chatId] = {
      chatId: chatId,
      isPlaying: true,
      rolls: 0,
      maxRoll: newMaxRoll
    }

    await ctx.replyWithHTML(`<b>${player.displayName}</b> starting new ☠🎲 <i>(${MIN} - ${games[chatId].maxRoll})</i>`)
  }
}

async function helpMenu (ctx, params) {
  if (params.length === 1 && _.toLower(params[0] === '@rolobot')) {
    ctx.replyWithHTML('How to use this bot:\n- Type <code>/dr new [num]</code> to start a new game.')
  }
}

function parseParams (message) {
  return _.drop(_.split(message, ' '))
}

function getDisplayName (player) {
  if (player.username) {
    return player.username
  }
  return `${_.camelCase(player.first_name + player.last_name)}`
}

module.exports.throwDice = throwDice
module.exports.startGame = startGame
module.exports.parseParams = parseParams
module.exports.getDisplayName = getDisplayName
module.exports.helpMenu = helpMenu
