const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const input = readFile(path.join(__dirname, './input.txt'))

const nullifyReactions = R.pipe(
  // Chained pairs of 2 (eg. [1, 2, 3, 4] => [ [1, 2], [2, 3], [3, 4] ]
  R.aperture(2),
  // Filter pairs where letters are xX or Xx
  R.filter(([a, b]) => b === (isUpper(a) ? a.toLowerCase() : a.toUpperCase())),
  // Join these pairs again
  R.map(R.join(''))
)

const noReactionsLeft = R.pipe(nullifyReactions, R.length, R.equals(0))
const applyNullifyingReaction = (polymer, nullifiedReaction) => R.replace(nullifiedReaction, '', polymer)

const reducePolymer = R.until(
  noReactionsLeft,
  // Replace reactions that nullify each other
  r => R.reduce(
    applyNullifyingReaction,
    r,
    nullifyReactions(r)
  )
)

const partOne = R.pipe(
  reducePolymer,
  R.length
)

const isUpper = s => s === s.toUpperCase()

console.log('Part 1:', partOne(input))
