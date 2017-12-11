const fs = require('fs-extra')
const path = require('path')

const solveBothTasks = (listSeq) => {

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

  const manhattanDistHex = ({x, y}) => {
    if (Math.sign(x) === Math.sign(y)) {
      return Math.abs(x + y)
    }
    return Math.max(Math.abs(x), Math.abs(y))
  }

  let furthestEver = 0

  let result = listSeq.map(mapInstructions).reduce((c, a) => {
    c.x += a[0]
    c.y += a[1]
    let currentDist = manhattanDistHex(c)
    furthestEver = (furthestEver > currentDist) ? furthestEver : currentDist
    return c
  }, {x: 0, y: 0})

  return {absDist: manhattanDistHex(result), furthestEver}
}

const solveTasks = (inputString) => {

  console.log(solveBothTasks(inputString.split(',')))

}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)