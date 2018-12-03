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

const partOne = input => {
  const {twoLetters, threeLetters} = R.applySpec({
    twoLetters: getLetters(2),
    threeLetters: getLetters(3)
  })(input)

  return {threeLetters, twoLetters, result: threeLetters * twoLetters}
}

const partTwo = input => {
  const xprod = R.xprod(input, input)
  const correctPairs = R.filter(([a, b]) => {
    if (a === b) {
      //ignore duplicates
      return false
    }
    const zippedPairs = R.zip(R.split('', a), R.split('', b))
    const equalZippedPairs = R.filter(arrayPairIsEqual, zippedPairs)

    // One letter mismatch
    return equalZippedPairs.length === a.length - 1
  }, xprod)

  // Dedupe as xprod gives [1,2] and [2,1] as combinations (all possible ones, with "duplicates")
  const correctPair = R.last(correctPairs)

  return R.pipe(R.filter(arrayPairIsEqual), R.map(R.last), R.join(''))(R.zip(...correctPair))
}

const arrayPairIsEqual = ([x, y]) => R.equals(x, y)

const valuesInclude = R.useWith(R.includes, [R.identity, R.values])
const countedByLetters = R.map(R.countBy(R.identity))
const filterAndCount = R.pipe(R.filter, R.length)
const getLetters = R.useWith(filterAndCount, [valuesInclude, countedByLetters])
