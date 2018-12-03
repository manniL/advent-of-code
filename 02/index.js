const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const run = async () => {
  const input = await readFile(path.join(__dirname, './input.txt'), 'utf-8')
  const formattedInput = formatInput(input)

  console.log('Part 1:', partOne(formattedInput))
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

const valuesInclude = R.useWith(R.includes, [R.identity, R.values])
const countedByLetters = R.map(R.countBy(R.identity))
const filterAndCount = R.pipe(R.filter, R.length)
const getLetters = R.useWith(filterAndCount, [valuesInclude, countedByLetters])
