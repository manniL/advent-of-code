const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const serialNumber = R.pipe(readFile, Number)(path.join(__dirname, './input.txt'))

const GRID_SIZE = 300

const GRID_RANGE = R.range(0, GRID_SIZE)

const calculateRackId = R.add(10)

const getHundredsDigit = R.pipe(
  R.toString,
  R.nth(-3)
)

const sub5 = R.flip(R.subtract)(5)

const calculatePowerLevel = serialNumber => (x, y) => {
  const getInitialPowerLevel = R.converge(
    R.multiply,
    [
      R.identity,
      R.pipe(
        R.multiply(y),
        R.add(serialNumber)
      )]
  )

  return R.pipe(
    calculateRackId,
    getInitialPowerLevel,
    getHundredsDigit,
    sub5
  )(x)
}

const grid = R.map(y => R.map(x => calculatePowerLevel(serialNumber)(x, y), GRID_RANGE), GRID_RANGE)

let part1 = grid => {
  let largestGrid = {x: 0, y: 0, power: 0}

  const checkRange = R.range(1, 298)
  const squareRange = R.range(0, 3)

  // Far from ideal :|
  R.forEach(
    x => R.forEach(
      y => {
        const power = R.sum(R.map(
          R.pipe(
            row => R.map(col => grid[x + row][y + col], squareRange),
            R.sum,
          ),
          squareRange
        ))

        if (power > largestGrid.power) {
          largestGrid = {x, y, power}
        }
      },
      checkRange
    ),
    checkRange
  )

  return `${largestGrid.y},${largestGrid.x}`
}

console.log('Part 1: ' + part1(grid))

// Still imperative :(

let part2 = grid => {
  let largestGrid = {x: 0, y: 0, power: 0, size: 0}

  const checkRange = R.range(1, 18)
  const sizeRange = size => R.range(1, 301 - size)
  const squareSizeRange = size => R.range(0, size)

  R.forEach(
    size => R.forEach(x => R.forEach(y => {
      const power = R.sum(R.map(
        R.pipe(
          row => R.map(col => grid[x + row][y + col], squareSizeRange(size)),
          R.sum,
        ),
        squareSizeRange(size)
      ))

      if (power > largestGrid.power) {
        largestGrid = {x, y, power, size}
      }
    }, sizeRange(size)), sizeRange(size)),
    checkRange
  )

  return `${largestGrid.y},${largestGrid.x},${largestGrid.size}`
}

console.log('Part 2: ' + part2(grid))
