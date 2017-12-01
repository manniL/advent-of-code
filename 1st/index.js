const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveCaptcha = (numberString) => {
  const splitNumbers = numberString.split('')

  //Push first number again for evaluation
  splitNumbers.push(splitNumbers[0])

  const sumUpIfEqual = (carry, pair) => {
    return carry + (pair[0] === pair[1] ? pair[0] : 0)
  }

  let result = Lazy(splitNumbers).map((o) => parseInt(o)).consecutive(2).reduce(sumUpIfEqual, 0)
  console.log(result)
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveCaptcha)