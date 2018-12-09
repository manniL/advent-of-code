const R = require('ramda')
const { readFile } = require('../utils/fs')
const insert = require('../utils/insert')
const path = require('path')

const input = readFile(path.join(__dirname, './input.txt'))

//418 players; last marble is worth 70769 points

const [PLAYER_COUNT, LAST_MARBLE] = R.pipe(
  R.match(/(\d+) players; last marble is worth (\d+) points/),
  R.drop(1),
  R.take(2),
  R.map(Number)
)(input)

const SECOND_SCORE_MARBLE_OFFSET = -7

const SPECIAL_MARBLE_MULTIPLE = 23

const isLastMarble = R.equals(LAST_MARBLE + 1)

const object = {
  scores: R.map(R.always(0), R.range(0, PLAYER_COUNT)),
  currentPlayerIndex: 0,
  marbles: [0],
  currentMarbleIndex: 0,
  nextMarble: 1,
  lastScore: 0
}

const marblesLens = R.lensProp('marbles')
const currentMarbleIndexLens = R.lensProp('currentMarbleIndex')
const nextMarbleLens = R.lensProp('nextMarble')
const currentPlayerIndexLens = R.lensProp('currentPlayerIndex')
const scoresLens = R.lensProp('scores')
const lastScoreLens = R.lensProp('lastScore')

const isSpecialMarble = R.pipe(
  R.view(nextMarbleLens),
  R.flip(R.mathMod)(SPECIAL_MARBLE_MULTIPLE)
)

const getPositionForNextMarble = R.pipe(
  R.view(currentMarbleIndexLens),
  R.add(2)
)

const setCurrentMarbleIndex = state => {
  const [nextMarble, marbles] = R.juxt([
    R.view(nextMarbleLens),
    R.view(marblesLens)
  ])(state)

  return R.set(
    currentMarbleIndexLens,
    R.indexOf(nextMarble, marbles)
  )(state)
}
const incrementNextMarble = R.over(nextMarbleLens, R.inc)
const moveToNextPlayer = state => {
  const newPlayerIndex = R.pipe(
    R.view(currentPlayerIndexLens),
    R.pipe(
      R.inc,
      R.flip(R.mathMod)(PLAYER_COUNT)
    )
  )(state)

  return R.set(currentPlayerIndexLens, newPlayerIndex)(state)
}

const insertNextMarble = state => {
  const nextPosition = getPositionForNextMarble(state)
  return R.pipe(
    R.over(marblesLens, insert(nextPosition, R.view(nextMarbleLens, state))),
    setCurrentMarbleIndex
  )(state)
}

const treatSpecialMarble = state => {
  const specialMarbleCount = R.view(nextMarbleLens)(state)
  const marbles = R.view(marblesLens)(state)
  const modMarbleLength = R.flip(R.mathMod)(R.length(marbles))
  const currentMarbleIndex = R.view(currentMarbleIndexLens)(state)
  const otherScoreMarbleIndex = modMarbleLength(currentMarbleIndex + SECOND_SCORE_MARBLE_OFFSET)
  const otherScoreMarbleCount = R.nth(otherScoreMarbleIndex, marbles)

  const score = R.add(specialMarbleCount, otherScoreMarbleCount)

  const currentPlayerIndex = R.view(currentPlayerIndexLens)(state)

  // Remove second marble
  // Set new current Marble

  const setLastScore = R.set(lastScoreLens, score)
  const addScoreToPlayer = R.over(scoresLens, R.adjust(currentPlayerIndex, R.add(score)))
  const removeOffsetMarble = R.over(marblesLens, R.remove(otherScoreMarbleIndex, 1))
  const setCurrentMarble = R.set(currentMarbleIndexLens, otherScoreMarbleIndex)

  return R.pipe(
    addScoreToPlayer,
    setLastScore,
    removeOffsetMarble,
    setCurrentMarble,
  )(state)
}

const result = R.pipe(
  R.until(
    R.pipe(
      R.prop('nextMarble'),
      isLastMarble
    ),
    R.pipe(
      R.ifElse(
        isSpecialMarble,
        insertNextMarble,
        treatSpecialMarble,
      ),
      incrementNextMarble,
      moveToNextPlayer,
    )
  ),
  R.prop('scores'),
  R.reduce(R.max, 0)
)(object)

console.log('RESULT', result)

/*
The Elves play this game by taking turns arranging the marbles in a circle according to very particular rules.
The marbles are numbered starting with 0 and increasing by 1 until every marble has a number.

First, the marble numbered 0 is placed in the circle. At this point, while it contains only a single marble, it is still a circle:
 the marble is both clockwise from itself and counter-clockwise from itself. This marble is designated the current marble.

Then, each Elf takes a turn placing the lowest-numbered remaining marble into the circle between the marbles that are
1 and 2 marbles clockwise of the current marble. (When the circle is large enough, this means that there is one marble
between the marble that was just placed and the current marble.) The marble that was just placed then becomes the current marble.

However, if the marble that is about to be placed has a number which is a multiple of 23, something entirely different happens.
First, the current player keeps the marble they would have placed, adding it to their score. In addition, the marble 7
marbles counter-clockwise from the current marble is removed from the circle and also added to the current player's score.
The marble located immediately clockwise of the marble that was removed becomes the new current marble.

For example, suppose there are 9 players. After the marble with value 0 is placed in the middle,
each player (shown in square brackets) takes a turn. The result of each of those turns would produce circles of marbles like this,
where clockwise is to the right and the resulting current marble is in parentheses:

The goal is to be the player with the highest score after the last marble is used up. Assuming the example above ends after the marble numbered 25, the winning score is 23+9=32 (because player 5 kept marble 23 and removed marble 9, while no other player got any points in this very short example game).

Here are a few more examples:

    10 players; last marble is worth 1618 points: high score is 8317
    13 players; last marble is worth 7999 points: high score is 146373
    17 players; last marble is worth 1104 points: high score is 2764
    21 players; last marble is worth 6111 points: high score is 54718
    30 players; last marble is worth 5807 points: high score is 37305

 */
