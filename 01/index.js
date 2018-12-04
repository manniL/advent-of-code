const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const partOne = R.sum
// Not very satisfied as I'd love to distinguish between the halting and the normal output

const partTwo = input => {
  /* Courtesy to @rakeshpai for the idea. Way better than the old hacky solution */

  // Impure infinite generator
  const getNextInput = ((inputArray) => {
    const inputGenerator = (function * () {
      let currentIndex = 0

      while (true) {
        yield inputArray[currentIndex]
        currentIndex = (currentIndex + 1) % inputArray.length
      }
    })()

    return () => inputGenerator.next().value
  })(input)
  const init = () => [getNextInput(), new Set()]

  return R.pipe(
    init,
    R.until(
      ([currentFrequency, frequencies]) => frequencies.has(currentFrequency),
      ([currentFrequency, frequencies]) => {
        frequencies.add(currentFrequency)
        currentFrequency += getNextInput()
        return [currentFrequency, frequencies]
      }),
    R.head
  )()
}

run()

const formatInput = R.map(Number)
const formattedInput = formatInput(input)

console.log('Part 1:', partOne(formattedInput))
console.log('Part 2:', partTwo(formattedInput))
