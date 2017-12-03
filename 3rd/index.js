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

const solveSpirals = (number) => {
  number = parseInt(number)-1
  console.log(solveFirstSpiral(number))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveSpirals)