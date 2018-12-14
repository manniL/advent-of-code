const {readFileSync} = require('fs')
const R = require('ramda')

const readFileWithoutTrim = R.pipe(
  readFileSync,
  f => f.toString('utf8')
)

const readFile = R.pipe(
  readFileWithoutTrim,
  R.trim
)

const readFileAndSplitByLines = R.pipe(
  readFile,
  R.split('\n')
)

module.exports = {
  readFileWithoutTrim,
  readFile,
  readFileAndSplitByLines
}
