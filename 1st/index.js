const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveFirst = (numberString) => {
  const splitNumbers = numberString.split('')

  //Push first number again for evaluation
  splitNumbers.push(splitNumbers[0])

  const sumUpIfEqual = (carry, pair) => {
    return carry + (pair[0] === pair[1] ? pair[0] : 0)
  }

  let result = Lazy(splitNumbers).map((o) => parseInt(o)).consecutive(2).reduce(sumUpIfEqual, 0)
  console.log(result)
}

const solveSecondCaptcha = (numberString) => {
  const splitNumbers = numberString.split('')

  const sumUpIfEqual = (carry, pair) => {
    return carry + (pair[0] === pair[1] ? pair[0] : 0)
  }

  let sequence = Lazy(splitNumbers)
    .map((o) => parseInt(o))

  let result = sequence.map((value, index) => {
    let halfLength = sequence.length() / 2
    if (index <= halfLength) {
      return [value, sequence.get(halfLength + index)]
    }
    return undefined
  })
    .filter()
    .reduce(sumUpIfEqual, 0) * 2
  console.log(result)
}

const solveCaptchas = (numberString) => {
  solveFirst(numberString)
  solveSecondCaptcha(numberString)
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveCaptchas)