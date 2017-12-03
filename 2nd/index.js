const fs = require('fs-extra')
const path = require('path')
const Lazy = require('lazy.js')

const mapDifference = (arr) => {
  let seq = Lazy(arr).map(i => parseInt(i))
  return seq.max() - seq.min()
}

const mapEvenMod = (arr) => {
  let seq = Lazy(arr).map(i => parseInt(i)).sort()
  return seq.map((number) => {
    return seq.find((sn) => sn !== number && sn % number === 0) / number
  }).filter().first()
}

const solveFirstChecksum = (seq) => {
  const result = seq.map(mapDifference).reduce((carry, integer) => carry + integer, 0)
  console.log(result)
}

const solveSecondChecksum = (seq) => {
  const result = seq.map(mapEvenMod).reduce((carry, integer) => carry + integer, 0)
  console.log(result)
}

const solveChecksums = (numberString) => {
  const seq = Lazy(numberString.split('\n')).map((line) => line.split('\t'))

  solveFirstChecksum(seq)
  solveSecondChecksum(seq)
}

fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveChecksums)