const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const run = async () => {
  const input = await readFile(path.join(__dirname, './input.txt'), 'utf-8')
  const formattedInput = formatInput(input)

  console.log('Part 1:', partOne(formattedInput))
  // console.log('Part 2:', partTwo(formattedInput))
}

run()

const formatInput = R.pipe(R.split('\n'), R.dropLast(1), R.map(str => {
  [, id, positionY, positionX, sizeY, sizeX] = R.match(/^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/)(str)
  return {
    id,
    position: {
      x: Number(positionX),
      y: Number(positionY)
    },
    size: {
      x: Number(sizeX),
      y: Number(sizeY)
    }
  }
}))

const partOne = input => {
  const inches = R.reduce(getInchesForFabric, {current: new Map(), dupes: new Map()}, input)
  // count of all elements - count of unique elements = count of duplicate items
  return inches.dupes.size
}

const getInchesForFabric = (({current, dupes}, {id, position, size}) => {
  // "Zero based"
  const rangeX = R.range(position.x + 1, position.x + size.x + 1)
  const rangeY = R.range(position.y + 1, position.y + size.y + 1)
  const pairs = R.map(([x, y]) => `${x}_${y}`, R.xprod(rangeY, rangeX))
  pairs.forEach(pair => {
    if (dupes.has(pair)) {
      // In dupes and in current
      return
    }
    if (!current.has(pair)) {
      // Not in current at all
      current.set(pair, 0)
      return
    }
    // In current but not in dupes
    dupes.set(pair, 0)
  })
  return {current, dupes}
})
