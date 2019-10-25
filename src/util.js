var _ = require('lodash')

const MIN = 1
const MAX = 9999

async function throwDice (ctx, player) {
  if (_.isUndefined(ctx.session.game.lastPlayer)) {
    ctx.session.game.lastPlayer = player
  } else if (player.playerId === ctx.session.game.lastPlayer.playerId) {
    await ctx.replyWithHTML(`<b>${player.displayName}</b> already rolled, waiting for other players`)
    return
  }

  ctx.session.game.lastPlayer = player
  ctx.session.game.rolls++

  let roll = _.random(MIN, ctx.session.game.maxRoll)

  await ctx.replyWithHTML(`<b>${player.displayName}</b> rolls <b>${roll}</b>  <i>(${MIN} - ${ctx.session.game.maxRoll})</i>`)

  if (roll === 1) {
    ctx.session.game.isPlaying = false
    await ctx.replyWithHTML(`<b>${player.displayName}</b> ☠☠☠ in ${ctx.session.game.rolls} rolls!`)
  } else {
    ctx.session.game.maxRoll = roll
  }
}

async function startGame (ctx, params, chatId, player) {
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

  if (_.isUndefined(ctx.session.game)) {
    ctx.session.game = {
      'chatId': chatId,
      'isPlaying': false,
      'rolls': 0,
      'maxRoll': MAX
    }
  }

  if (newGame) {
    if (!ctx.session.game.isPlaying) {
      ctx.session.game = {
        'chatId': chatId,
        'isPlaying': true,
        'rolls': 0,
        'maxRoll': newMaxRoll
      }

      await ctx.replyWithHTML(`<b>${player.displayName}</b> starting new ☠🎲 <i>(${MIN} - ${ctx.session.game.maxRoll})</i>`)
    } else {
      await ctx.replyWithHTML(`☠🎲 <i>in progress</i>`)
    }
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
