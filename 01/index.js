const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const run = async () => {
  const input = await readFile(path.join(__dirname, './input.txt'), 'utf-8')
  const formattedInput = formatInput(input)

  console.log('Part 1:', partOne(formattedInput))
  console.log('Part 2:', partTwo(formattedInput))
}

const partOne = R.sum
// Not very satisfied as I'd love to distinguish between the halting and the normal output
const partTwo = input => R.reduceWhile(
  acc => Array.isArray(acc),
  ([currentFrequency, frequencies], x) => {
    const newFrequency = currentFrequency + x
    if (frequencies.includes(newFrequency)) {
      return newFrequency
    }

    return [newFrequency, frequencies.concat(newFrequency)]
  },
  [0, []],
  // Hacky solution as you can't "cycle" the input of reduceWhile
)(R.flatten(R.repeat(input, 150)))

run()

const formatInput = R.pipe(R.split('\n'), R.dropLast(1), R.map(R.pipe(R.trim, Number)))
