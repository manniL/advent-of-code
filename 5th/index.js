const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveFirstInstruction = (seq) => {
  let nextPos = 0
  let steps = 0

  while (nextPos >= 0 && nextPos < seq.length) {
    nextPos = nextPos + seq[nextPos]++
    steps++
  }
  return steps
}

const solveInstructions = (numberString) => {
  const seq = numberString.split('\n').map((n) => parseInt(n))
  console.log(solveFirstInstruction(seq))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveInstructions)