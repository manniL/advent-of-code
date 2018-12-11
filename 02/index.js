const R = require('ramda')
const {readFileAndSplitByLines} = require('../utils/fs.js')
const path = require('path')

const arrayPairIsEqual = R.converge(R.equals, [R.head, R.last])

const valuesInclude = R.useWith(R.includes, [R.identity, R.values])
const countByLetters = R.map(R.countBy(R.identity))
const filterAndCount = R.pipe(R.filter, R.length)

const getLetters = R.useWith(filterAndCount, [valuesInclude, countByLetters])

const createHalfTable = (a, b = [...a]) => {
  const [x, ...xs] = a
  const [, ...ys] = b
  return a.length && b.length
    ? ys.map(y => [x, y]).concat(createHalfTable(xs, ys))
    : []
}

const splitIntoCharacters = R.split('')

const partOne = R.pipe(
  R.applySpec({
    twoLetters: getLetters(2),
    threeLetters: getLetters(3)
  }),
  R.props(['twoLetters', 'threeLetters']),
  R.apply(R.multiply)
)

const zipPairs = R.pipe(
  R.map(splitIntoCharacters),
  R.apply(R.zip),
)

const filterDifferentPairs = R.reject(arrayPairIsEqual)

const pairWithOneLetterMismatch = R.pipe(
  zipPairs,
  filterDifferentPairs,
  R.length,
  R.equals(1)
)

const partTwo = R.pipe(
  createHalfTable,
  R.find(pairWithOneLetterMismatch),
  R.apply(R.zip),
  R.filter(arrayPairIsEqual),
  R.map(R.last),
  R.join('')
)

const input = readFileAndSplitByLines(path.join(__dirname, './input.txt'))

console.log('Part 1:', partOne(input))
console.log('Part 2:', partTwo(input))
