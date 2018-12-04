const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const run = async () => {
  const input = await readFile(path.join(__dirname, './input.txt'), 'utf-8')
  const formattedInput = formatInput(input)

  console.log('Part 1:', partOne(formattedInput))
  console.log('Part 2:', partTwo(formattedInput))
}

run()

const formatInput = R.pipe(R.split('\n'), R.dropLast(1))

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
  R.converge(R.multiply, [R.prop('twoLetters'), R.prop('threeLetters')]))

const pairWithOneLetterMismatch = ([a, b]) => {
  const zippedPairs = R.zip(splitIntoCharacters(a), splitIntoCharacters(b))
  const equalZippedPairs = R.filter(arrayPairIsEqual, zippedPairs)

  // One letter mismatch
  return equalZippedPairs.length === a.length - 1
}

const partTwo = R.pipe(
  createHalfTable,
  R.find(pairWithOneLetterMismatch),
  R.converge(R.zip, [R.head, R.last]),
  R.filter(arrayPairIsEqual),
  R.map(R.last),
  R.join('')
)

