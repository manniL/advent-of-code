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

// Same result for day 2, you just have to wait for ages ^^#
// Linked list might be better here
