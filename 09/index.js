const fs = require('fs-extra')
const path = require('path')

const solveFirstTask = (string) => {

  const calculateScore = (array, multiplier = 1) => {
    if (array.length) {
      return array.reduce((c, a) => c + calculateScore(a, multiplier + 1), 0) + multiplier
    }
    return multiplier
  }
  return calculateScore(JSON.parse(string
    .replace(/!.?/g, '')
    .replace(/,?<.*?>,?/g, '')
    .replace(/{/g, '[')
    .replace(/}/g, ']')
  ))
}

const solveTasks = (inputString) => {

  console.log(solveFirstTask(inputString))

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)