const R = require('ramda')
const {readFile} = require('../utils/fs.js')
const path = require('path')

const run = async () => {
  const input = await readFile(path.join(__dirname, './input.txt'), 'utf-8')
  const result = R.pipe(R.split('\n'), R.map(Number), R.sum)(input)
  console.log('Part 1: ', result)
}

run()

