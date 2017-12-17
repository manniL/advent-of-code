const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const sumUpIfEqual = (carry, pair) => {
  return carry + (pair[0] === pair[1] ? pair[0] : 0)
}

const solveFirstCaptcha = (numberString) => {

  //Push first number again for evaluation
  numberString.push(numberString[0])

  return Lazy(numberString).consecutive(2).reduce(sumUpIfEqual, 0)
}

const solveSecondCaptcha = (sequence) => {

  let halfLength = sequence.length / 2

  return sequence.map((value, index) => {
    if (index <= halfLength) {
      return [value, sequence[(halfLength + index)]]
    }
    return undefined
  })
    .filter((a) => a)
    .reduce(sumUpIfEqual, 0) * 2
}

const solveCaptchas = (numberString) => {
  numberString = numberString.split('').map((n) => parseInt(n))
  console.log(solveFirstCaptcha([...numberString]), solveSecondCaptcha([...numberString]))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveCaptchas)
