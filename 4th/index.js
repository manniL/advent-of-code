const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const solveFirstPassphrase = (seq) => {
  return seq.map((lineSeq) => lineSeq.uniq().toArray().length === lineSeq.length()).filter().toArray().length
}

const solvePassphrases = (numberString) => {
  const seq = Lazy(numberString.split('\n')).map((line) => Lazy(line.split(' ')))

  console.log(solveFirstPassphrase(seq))
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solvePassphrases)