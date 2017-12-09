const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const sumUpIfEqual = (carry, pair) => {
  return carry + (pair[0] === pair[1] ? pair[0] : 0)
}

const solveFirstCaptcha = (numberString) => {
  const splitNumbers = numberString.split('')

  //Push first number again for evaluation
  splitNumbers.push(splitNumbers[0])

  return Lazy(splitNumbers).map((o) => parseInt(o)).consecutive(2).reduce(sumUpIfEqual, 0)
}

const solveSecondCaptcha = (numberString) => {
  const splitNumbers = numberString.split('')

  let sequence = Lazy(splitNumbers)
    .map((o) => parseInt(o))

  let halfLength = sequence.length() / 2

  return sequence.map((value, index) => {
    if (index <= halfLength) {
      return [value, sequence.get(halfLength + index)]
    }
    return undefined
  })
    .filter()
    .reduce(sumUpIfEqual, 0) * 2
}

const solveCaptchas = (numberString) => {
  console.log(solveFirstCaptcha(numberString), solveSecondCaptcha(numberString))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveCaptchas)
