const fs = require('fs-extra')
const path = require('path')

const solveFirstTask = (input) => {
  let spinlock = [0]
  let position = 0
  for (let count = 1; count <= 2017; count++) {
    let insertionIndex = ((position + input) % spinlock.length) + 1
    spinlock.splice(insertionIndex, 0, count)
    position = insertionIndex
  }
  return spinlock[(position + 1) % spinlock.length]
}

const solveSecondTask = (input) => {
  let position = 0
  let result = 1
  for (let count = 0; count <= 5E7; count++) {
    position = (position + input + 1) % (count + 1)
    if (position === 0) {
      result = count + 1
    }
  }
  return result
}

const solveTasks = (input) => {
  input = parseInt(input)
  console.log(solveFirstTask(input), solveSecondTask(input))
}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks).catch(e => console.error(e))