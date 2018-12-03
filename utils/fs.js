const fs = require('fs')
const promisify = require('util').promisify

module.exports = {
  readFile: promisify(fs.readFile)
}
