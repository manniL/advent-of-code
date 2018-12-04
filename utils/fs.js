const {readFileSync} = require('fs')
const R = require('ramda')

const readFile = R.pipe(
  readFileSync,
  f => f.toString('utf8'),
  R.trim,
)
const readFileAndSplitByLines = R.pipe(
  readFile,
  R.split('\n')
)

module.exports = {
  readFile,
  readFileAndSplitByLines
}
