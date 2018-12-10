const R = require('ramda')
const {readFileAndSplitByLines} = require('../utils/fs.js')
const path = require('path')

let input = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

const formatInput = R.map(
  R.pipe(
    R.match(/position=< ?(-?\d+),  ?(-?\d+)> velocity=< ?(-?\d+),  ?(-?\d+)>/),
    R.drop(1),
    R.take(4),
    R.map(Number),
    R.zipObj(['positionX', 'positionY', 'velocityX', 'velocityY']),
  )
)

input = formatInput(input)

const moveTiles = R.over(
  R.lensProp('input'),
  R.map(obj => {
    obj.positionX += obj.velocityX
    obj.positionY += obj.velocityY
    return obj
  }))

const revertLastStep = R.pipe(
  R.over(
    R.lensProp('input'),
    R.map(obj => {
      obj.positionX -= obj.velocityX
      obj.positionY -= obj.velocityY
      return obj
    })
  ),
)

const createStartObject = R.applySpec({
  input: R.identity,
  min: R.always(Infinity),
  elapsed: R.always(0),
  targetReached: R.F
})

const setNewMin = state => {
  let max = R.pipe(
    R.view(R.lensProp('input')),
    R.pluck('positionY'),
    R.reduce(R.max, -Infinity),
  )(state)

  const minLens = R.lensProp('min')

  const isNewMin = R.pipe(
    R.view(minLens),
    R.lt(max),
  )
  return R.pipe(
    R.ifElse(
      isNewMin,
      R.set(minLens, max),
      R.set(R.lensProp('targetReached'), true)),
  )(state)
}

const incrementTime = R.over(R.lensProp('elapsed'), R.inc)

const targetHasBeenReached = R.pipe(
  R.prop('targetReached'),
  R.equals(true)
)

const positionsAfterMovement = R.pipe(
  createStartObject,
  R.until(
    targetHasBeenReached,
    R.pipe(
      moveTiles,
      setNewMin,
      incrementTime
    )
  ),
  revertLastStep,
  R.tap(R.pipe(R.prop('elapsed'), x => console.log(`Done after ${x - 1} seconds!`))),
  R.prop('input')
)(input)

const findBoundaries = R.juxt([
  R.pipe(
    R.pluck('positionX'),
    R.reduce(R.min, Infinity)
  ),
  R.pipe(
    R.pluck('positionY'),
    R.reduce(R.min, Infinity)
  ),
  R.pipe(
    R.pluck('positionX'),
    R.reduce(R.max, -Infinity)
  ),
  R.pipe(
    R.pluck('positionY'),
    R.reduce(R.max, -Infinity)
  )
])

const [minX, minY, maxX, maxY] = findBoundaries(positionsAfterMovement)

const totalX = Math.abs(maxX) + 2
const totalY = Math.abs(maxY) + 2

const createGrid = R.curry((totalX, totalY) => R.map(
  R.always(R.repeat('.', totalX)),
  R.range(1, totalY + 1)
))


const addInput = input => initialGrid => R.reduce(
  (grid, {positionY, positionX}) => R.set(R.lensPath([positionY, positionX]), '#')(grid),
  initialGrid,
  input
)

const formatGrid = R.pipe(
  R.drop(minY - 1),
  R.map(R.drop(minX - 1))
)

const getResult = R.pipe(R.map(
  R.join('')
), R.join('\n'))

R.pipe(
  addInput(input),
  formatGrid,
  getResult,
  R.tap(console.log)
)(createGrid(totalX, totalY))




