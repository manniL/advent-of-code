const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveFirstSpiral = (number) => {

  let previous = null
  let current = {x: 0, y: 0}
  let dx = 0
  let dy = -1
  Lazy.generate((i) => i + 1, number).each(() => {
    previous = current
    if (current.x === current.y
      || (current.x < 0 && current.x === -current.y)
      || (current.x > 0 && current.x === 1 - current.y)) {
      [dx, dy] = [-dy, dx]
    }
    current.x += dx
    current.y += dy
  })
  return Math.abs(previous.x) + Math.abs(previous.y)
}

function findValuesAround (grid, position, bias) {
  return Lazy([[1, 0], [1, 1], [0, 1], [-1, 0], [-1, -1], [-1, 1], [1, -1], [0, -1]])
    .map(([x, y]) => {
      return grid[Math.max(0, x + position.x + bias)][Math.max(0, y + position.y + bias)]
    })
    .filter()
    .reduce((c, x) => c + x)
}

const solveSecondSpiral = (number) => {

  let grid = Lazy(new Array(100).fill(0)).map(() => new Array(100).fill(0)).toArray()
  let position = {x: 0, y: 0}
  let value = 0
  let bias = 50
  let dx = 0
  let dy = -1

  while (value <= number - 1) {
    value = grid[position.x + bias][position.y + bias] = findValuesAround(grid, position, bias) || 1
    console.log('VALUE', value)
    if (position.x === position.y
      || (position.x < 0 && position.x === -position.y)
      || (position.x > 0 && position.x === 1 - position.y)) {
      [dx, dy] = [-dy, dx]
    }
    position.x += dx
    position.y += dy
  }
  return value
}

const solveSpirals = (number) => {
  number = parseInt(number) - 1
  console.log(solveFirstSpiral(number), solveSecondSpiral(number))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveSpirals).catch((e) => console.error(e))