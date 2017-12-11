const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveFirstTask = (listSeq) => {

  const mapInstructions = (i) => {
    switch (i) {
      case 'ne':
        return [1, -1]
      case 'n':
        return [1, 0]
      case 'nw':
        return [0, 1]
      case 'sw':
        return [-1, 1]
      case 's' :
        return [-1, 0]
      case 'se':
        return [0, -1]
    }
  }
  let result = listSeq.map(mapInstructions).reduce((c, a) => {
    c.x += a[0]
    c.y += a[1]
    return c
  }, {x: 0, y: 0})

  if (Math.sign(result.x) === Math.sign(result.y)) {
    return Math.abs(result.x + result.y)
  }
  return Math.max(Math.abs(result.x), Math.abs(result.y))
}

const solveTasks = (inputString) => {

  console.log(solveFirstTask(inputString.split(',')))

}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)