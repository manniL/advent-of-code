const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const input = readFile(path.join(__dirname, './input.txt'))

const splitToChainedPairs = R.aperture(2)
const filterAffectedLetterPairs = R.filter(([a, b]) => b === (isUpper(a) ? a.toLowerCase() : a.toUpperCase()))

const nullifyReactions = R.pipe(
  // Chained pairs of 2 (eg. [1, 2, 3, 4] => [ [1, 2], [2, 3], [3, 4] ]
  splitToChainedPairs,
  // Filter pairs where letters are xX or Xx
  filterAffectedLetterPairs,
  // Join these pairs again
  R.map(R.join(''))
)

const noReactionsLeft = R.pipe(nullifyReactions, R.isEmpty)

const deleteString = R.flip(R.replace)('')
const deleteStringFromInput = R.flip(deleteString)

const removeNullifyingReactions = deleteStringFromInput

const react = r => R.reduce(
  removeNullifyingReactions,
  r,
  nullifyReactions(r)
)

const reducePolymer = R.until(
  noReactionsLeft,
  // Replace reactions that nullify each other
  react
)

const partOne = R.pipe(
  reducePolymer,
  R.length
)
const CHAR_CODE_A = 65
const CHAR_CODE_Z = 91
const alphabet = R.map(
  R.pipe(
    String.fromCharCode,
    R.toLower
  ),
  R.range(CHAR_CODE_A, CHAR_CODE_Z))

const toCaseInsensitiveRegExp = letter => new RegExp(letter, 'gi')

const replaceLetterOccurrences = input => R.pipe(
  toCaseInsensitiveRegExp,
  deleteStringFromInput(input)
)

const partTwo = input => {
  return R.pipe(
    R.map(
      R.pipe(
        replaceLetterOccurrences(input),
        reducePolymer,
        R.length
      )
    ),
    R.reduce(R.min, Infinity),
  )(alphabet)
}

const isUpper = s => s === s.toUpperCase()

console.log('Part 1:', partOne(input))
console.log('Part 2:', partTwo(input))
