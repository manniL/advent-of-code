const R = require('ramda')
const {readFileAndSplitByLines} = require('../utils/fs.js')
const path = require('path')

const partOne = input => {
  // Sort points by x,y values
  // Find the 4 "edges" (largest/smallest x/y coordinates)
  const [minX, minY, maxX, maxY] = findAreaBoundaries(input)

  const xRange = R.range(minX, maxX + 1)
  const yRange = R.range(minY, maxY + 1)
  const getLetterForCords = letterForCoords(input)
  const grid = R.map(y => R.map(x => getLetterForCords({x, y}), xRange), yRange)
  console.log(grid.map(row => row.join('')).join('\n'))
  const zonesWithInfiniteArea = charactersAtBorder(grid)
  const countedRows = R.map(R.countBy(R.identity))(grid)
  const letters = R.reduce(
    R.mergeWith(R.add),
    {}, countedRows)

  return R.pipe(
    R.omit(zonesWithInfiniteArea),
    R.toPairs,
    R.reduce(R.maxBy(R.last), [0])
  )(letters)
}

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
  const lettersWithDistances = points.map(({letter, ...cords}) => [letter, manhattanDistance(cords, record)])
  const distances = R.map(R.last)(lettersWithDistances)
  const [minLetter, minDistance] = R.reduce(R.minBy(R.last), [Infinity], lettersWithDistances)
  const hasMultipleLowDistances = R.pipe(R.filter(R.equals(minDistance)), R.length, R.flip(R.gt)(1))(distances)
  return hasMultipleLowDistances ? '.' : minLetter
}

const manhattanDistance = ({x: x1, y: y1}, {x: x2, y: y2}) => Math.abs(x2 - x1) + Math.abs(y2 - y1)

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
const alphabet = R.map(a => String.fromCharCode(a))(R.concat(R.range(65, 91), R.range(97, 123)))
const formatInput = R.pipe(
  R.map(
    R.pipe(
      R.split(', '),
      R.map(Number),
    )
  ),
  R.zipWith((letter, coords) => [letter, ...coords], alphabet),
  R.map(R.zipObj(['letter', 'x', 'y']))
)

console.log('Part 1:', partOne(formatInput(input)))
