const fs = require('fs-extra')
const path = require('path')

const solveFirstInstruction = (seq) => {
  let nextPos = 0
  let steps = 0

  while (typeof seq[nextPos] !== 'undefined') {
    nextPos = nextPos + seq[nextPos]++
    steps++
  }
  return steps
}

const solveSecondInstruction = (seq) => {
  let nextPos = 0
  let steps = 0

  while (typeof seq[nextPos] !== 'undefined') {
    nextPos = nextPos + ((seq[nextPos] >= 3) ? seq[nextPos]-- : seq[nextPos]++)
    steps++
  }

  return steps
}

const solveInstructions = (numberString) => {
  const seq = numberString.split('\n').map((n) => parseInt(n))
  console.log(solveFirstInstruction([...seq]), solveSecondInstruction([...seq]))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveInstructions)