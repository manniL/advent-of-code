const R = require('ramda')
const {readFileAndSplitByLines} = require('../utils/fs.js')
const path = require('path')

const charactersAtBorder = R.pipe(
  R.juxt([R.head,
    R.last,
    R.map(R.last),
    R.map(R.head)
  ]),
  R.unnest,
  R.uniq
)

const letterForCoords = points => record => {
  const lettersWithDistances = R.map(({letter, ...cords}) => [letter, manhattanDistance(cords, record)], points)
  const toDistances = R.map(R.last)
  const [minLetter, minDistance] = R.reduce(R.minBy(R.last), [Infinity], lettersWithDistances)
  const hasMultipleLowDistances = R.pipe(
    toDistances,
    R.filter(R.equals(minDistance)),
    R.length,
    R.flip(R.gt)(1)
  )(lettersWithDistances)
  return hasMultipleLowDistances ? '.' : minLetter
}

const distanceSumToAllCoords = points => record => {
  return R.pipe(
    R.map(manhattanDistance(record)),
    R.sum
  )(points)
}

const manhattanDistance = R.curry(({x: x1, y: y1}, {x: x2, y: y2}) => Math.abs(x2 - x1) + Math.abs(y2 - y1))

const getX = R.map(R.prop('x'))
const getY = R.map(R.prop('y'))
const min = R.reduce(R.min, Infinity)
const max = R.reduce(R.max, 0)

const findAreaBoundaries = R.juxt([
  R.pipe(getX, min),
  R.pipe(getY, min),
  R.pipe(getX, max),
  R.pipe(getY, max)
])

const input = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

// F*ck! There are more coordinate pairs than letters. Looked for over an hour for the mistake
// Use lower + uppercase letters now
const CHAR_CODE_UPPER_A = 65
const CHAR_CODE_UPPER_Z = 91
const CHAR_CODE_LOWER_A = 97
const CHAR_CODE_LOWER_Z = 123
const alphabet = R.map(
  String.fromCharCode,
  R.concat(R.range(CHAR_CODE_UPPER_A, CHAR_CODE_UPPER_Z), R.range(CHAR_CODE_LOWER_A, CHAR_CODE_LOWER_Z))
)

const formatInput = R.pipe(
  R.map(
    R.pipe(
      R.split(', '),
      R.map(Number),
    )
  ),
  R.zipWith(R.prepend, alphabet),
  R.map(R.zipObj(['letter', 'x', 'y']))
)

const partOne = input => {
  // Sort points by x,y values
  // Find the 4 "edges" (largest/smallest x/y coordinates)
  const [minX, minY, maxX, maxY] = findAreaBoundaries(input)

  const xRange = R.range(minX, maxX + 1)
  const yRange = R.range(minY, maxY + 1)
  const getLetterForCords = letterForCoords(input)
  const grid = R.map(y => R.map(x => getLetterForCords({x, y}), xRange), yRange)
  const mergeCounts = R.reduce(R.mergeWith(R.add), {})
  const countRows = R.map(R.countBy(R.identity))
  const zonesWithInfiniteArea = charactersAtBorder(grid)
  const removeInfiniteAreas = R.omit(zonesWithInfiniteArea)

  return R.pipe(
    countRows,
    mergeCounts,
    removeInfiniteAreas,
    R.toPairs,
    R.reduce(R.maxBy(R.last), [0])
  )(grid)
}

const AREA_DISTANCE_CRITERION = 10000
const partTwo = input => {
  // Sort points by x,y values
  // Find the 4 "edges" (largest/smallest x/y coordinates)
  const [minX, minY, maxX, maxY] = findAreaBoundaries(input)

  const xRange = R.range(minX, maxX + 1)
  const yRange = R.range(minY, maxY + 1)
  const distanceSumToAllCoordsWithInput = distanceSumToAllCoords(input)
  const grid = R.map(y => R.map(x => distanceSumToAllCoordsWithInput({x, y}), xRange), yRange)
  const countAreasWithRightDistance = R.map(
    R.pipe(
      R.filter(R.gt(AREA_DISTANCE_CRITERION)),
      R.length
    )
  )
  return R.pipe(countAreasWithRightDistance, R.sum)(grid)
}

console.log('Part 1:', partOne(formatInput(input)))
console.log('Part 2:', partTwo(formatInput(input)))
