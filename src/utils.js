var _ = require('lodash')

const MIN = 1
const MAX = 9999

async function throwDice (ctx, games, chatId, player) {
  if (!games[chatId].isPlaying) {
    try {
      await ctx.replyWithHTML(`Use <code>/dr new [num]</code> for new ☠🎲`)
    } catch (error) {
      console.error(`Failed to send "Start New Game" message: ${error.toString()}`)
    }

    return
  }

  if (!_.isUndefined(games[chatId].lastPlayer) &&
    player.playerId === games[chatId].lastPlayer.playerId &&
    !games[chatId].consecutiveRoll) {
    try {
      await ctx.replyWithHTML(`<b>${player.displayName}</b> already rolled, waiting for other players`)
    } catch (error) {
      console.error(`Failed to send "Waiting For Players" message: ${error.toString()}`)
    }

    return
  }

  games[chatId].lastPlayer = player
  games[chatId].rolls++

  const roll = _.random(MIN, games[chatId].maxRoll)

  try {
    await ctx.replyWithHTML(`<b>${player.displayName}</b> rolls <b>${roll}</b>  <i>(${MIN} - ${games[chatId].maxRoll})</i>`)
  } catch (error) {
    console.error(`Failed to send "Last Roll" message: ${error.toString()}`)
  }

  if (roll === 1) {
    games[chatId].isPlaying = false
    try {
      await ctx.replyWithHTML(`<b>${player.displayName}</b> ☠☠☠ in ${games[chatId].rolls} rolls!`)
    } catch (error) {
      console.error(`Failed to send "Loser" message: ${error.toString()}`)
    }
  } else {
    games[chatId].maxRoll = roll
  }
}

async function startGame (ctx, games, params, chatId, player) {
  let newMaxRoll = MAX
  let newGame = false
  let consecutiveRoll = false

  if (params.length >= 1) {
    if (_.toLower(params[0]) === 'new') {
      newGame = true

      if (params.length >= 2) {
        if (_.toLower(params[1]) === 'c') {
          consecutiveRoll = true
        } else {
          newMaxRoll = _.clamp(_.toInteger(params[1]), MIN, MAX)

          if (!_.isUndefined(params[2]) && _.toLower(params[2]) === 'c') {
            consecutiveRoll = true
          }
        }
      }
    }
  }

  if (_.isUndefined(games[chatId])) {
    games[chatId] = {
      chatId: chatId,
      isPlaying: false,
      rolls: 0,
      maxRoll: MAX,
      consecutiveRoll: consecutiveRoll,
      hasSeenDeleteMessage: false
    }
  }

  if (newGame) {
    games[chatId].chatId = chatId
    games[chatId].isPlaying = true
    games[chatId].rolls = 0
    games[chatId].maxRoll = newMaxRoll
    games[chatId].consecutiveRoll = consecutiveRoll

    try {
      await ctx.replyWithHTML(`<b>${player.displayName}</b> starting new ☠🎲 <i>(${MIN} - ${games[chatId].maxRoll})</i>`)
    } catch (error) {
      console.error(`Failed to send "New Game" message: ${error.toString()}`)
    }
  }
}

async function deleteMessage (ctx, games, chatId, player, botName) {
  let messageDeleted = false

  try {
    await ctx.deleteMessage()
    messageDeleted = true
  } catch (error) {
    console.error(`Failed to delete ${player.displayName}'s roll in chat ${chatId}: ${error.toString()}`)
  }

  if (!messageDeleted) {
    if (!games[chatId].hasSeenDeleteMessage) {
      try {
        await await ctx.replyWithHTML(
          `<i>To remove rolls from chat, give</i>
🎲<b>${botName}</b> <i>Delete Message privileges</i>
`
        )
      } catch (error) {
        console.error(`Failed to send "Tooltip to Remove Rolls" message: ${error.toString()}`)
      }

      games[chatId].hasSeenDeleteMessage = true
    }
  }
}

async function helpMenu (ctx, params, botName) {
  if (params.length === 1 && _.toLower(params[0]) === _.toLower(`@${botName}`)) {
    ctx.replyWithHTML(
      `How to use ${botName}:
- Type <code>/dr new [num]</code> to start a new game.
- Defaults to (${MIN} - ${MAX})
- Allow user to roll consecutively <code>/dr new [num] [c]</code>
`
    )
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
module.exports.deleteMessage = deleteMessage
