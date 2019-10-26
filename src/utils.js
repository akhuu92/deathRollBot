var _ = require('lodash')

const MIN = 1
const MAX = 9999

async function throwDice (ctx, games, source) {
  if (!games[source.chatId].isPlaying) {
    try {
      await ctx.replyWithHTML(`Use <code>/dr new [num]</code> for new ☠🎲`)
    } catch (error) {
      console.error(`Failed to send "Start New Game" message: ${error.toString()}`)
    }

    return
  }

  if (!_.isUndefined(games[source.chatId].lastPlayer) &&
  source.player.playerId === games[source.chatId].lastPlayer.playerId &&
    !games[source.chatId].consecutiveRoll) {
    try {
      await ctx.replyWithHTML(`<b>${source.player.displayName}</b> already rolled, waiting for other players`)
    } catch (error) {
      console.error(`Failed to send "Waiting For Players" message: ${error.toString()}`)
    }

    return
  }

  games[source.chatId].lastPlayer = source.player
  games[source.chatId].rolls++

  const roll = _.random(MIN, games[source.chatId].maxRoll)

  try {
    await ctx.replyWithHTML(`<b>${source.player.displayName}</b> rolls <b>${roll}</b>  <i>(${MIN} - ${games[source.chatId].maxRoll})</i>`)
  } catch (error) {
    console.error(`Failed to send "Last Roll" message: ${error.toString()}`)
  }

  if (roll === 1) {
    games[source.chatId].isPlaying = false
    try {
      await ctx.replyWithHTML(`<b>${source.player.displayName}</b> ☠☠☠ in ${games[source.chatId].rolls} rolls!`)
    } catch (error) {
      console.error(`Failed to send "Loser" message: ${error.toString()}`)
    }
  } else {
    games[source.chatId].maxRoll = roll
  }
}

async function startGame (ctx, games, source) {
  let newMaxRoll = MAX
  let newGame = false
  let consecutiveRoll = false

  if (source.params.length >= 1) {
    if (_.toLower(source.params[0]) === 'new') {
      newGame = true

      if (source.params.length >= 2) {
        if (_.toLower(source.params[1]) === 'c') {
          consecutiveRoll = true
        } else {
          newMaxRoll = _.clamp(_.toInteger(source.params[1]), MIN, MAX)

          if (!_.isUndefined(source.params[2]) && _.toLower(source.params[2]) === 'c') {
            consecutiveRoll = true
          }
        }
      }
    }
  }

  if (_.isUndefined(games[source.chatId])) {
    games[source.chatId] = {
      chatId: source.chatId,
      isPlaying: false,
      rolls: 0,
      maxRoll: MAX,
      consecutiveRoll: consecutiveRoll,
      hasSeenDeleteMessage: false
    }
  }

  if (newGame) {
    games[source.chatId].chatId = source.chatId
    games[source.chatId].isPlaying = true
    games[source.chatId].rolls = 0
    games[source.chatId].maxRoll = newMaxRoll
    games[source.chatId].consecutiveRoll = consecutiveRoll

    try {
      await ctx.replyWithHTML(`<b>${source.player.displayName}</b> starting new ☠🎲 <i>(${MIN} - ${games[source.chatId].maxRoll})</i>`)
    } catch (error) {
      console.error(`Failed to send "New Game" message: ${error.toString()}`)
    }
  }
}

async function deleteMessage (ctx, games, source, botName) {
  let messageDeleted = false

  try {
    await ctx.deleteMessage()
    messageDeleted = true
  } catch (error) {
    console.error(`Failed to delete ${source.player.displayName}'s roll in chat ${source.chatId}: ${error.toString()}`)
  }

  if (!messageDeleted) {
    if (!games[source.chatId].hasSeenDeleteMessage) {
      try {
        await await ctx.replyWithHTML(
          `<i>To remove rolls from chat, give</i>
🎲<b>${botName}</b> <i>Delete Message privileges</i>
`
        )
      } catch (error) {
        console.error(`Failed to send "Tooltip to Remove Rolls" message: ${error.toString()}`)
      }

      games[source.chatId].hasSeenDeleteMessage = true
    }
  }
}

async function helpMenu (ctx, source, botName) {
  if (source.params.length === 1 && _.toLower(source.params[0]) === _.toLower(`@${botName}`)) {
    ctx.replyWithHTML(
      `How to use ${botName}:
- Type <code>/dr new [num]</code> to start a new game.
- Defaults to (${MIN} - ${MAX})
- Allow user to roll consecutively <code>/dr new [num] [c]</code>
`
    )
  }
}

function parseMessage(message) {
  return {
    params: parseParams(message.text),
    chatId: message.chat.id,
    player: {
      playerId: message.from.id,
      displayName: getDisplayName(message.from)
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
module.exports.helpMenu = helpMenu
module.exports.deleteMessage = deleteMessage
module.exports.parseMessage = parseMessage