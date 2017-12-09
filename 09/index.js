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

const solveSecondTask = (string) => {

  return string.replace(/!.?/g, '').match(/<(.*?)>/g).reduce((c, s) => c + s.length - 2, 0)
}

const solveTasks = (inputString) => {

  console.log(solveFirstTask(inputString), solveSecondTask(inputString))

}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)