const fs = require('fs-extra')
const path = require('path')

const transformRange = (time, range) => range - Math.abs((time % (2 * range)) - range)

const solveFirstTask = (lines) => {
  let second = 0
  let caught = []
  let maxSeconds = lines.reduce((c, a) => Math.max(c, a.depth), 0)
  while (second <= maxSeconds) {
    //a.range - 1 because of OffByOne
    let currentlyCaught = lines.filter((a) => a.depth === second && !transformRange(second, a.range - 1))
    caught = caught.concat(currentlyCaught)
    second++
  }

  return caught.reduce((c, a) => c + a.depth * a.range, 0)
}

const didPacketCameThrough = (delay, lines) => {
  let second = 0
  let maxSeconds = lines.reduce((c, a) => Math.max(c, a.depth), 0)
  while (second <= maxSeconds) {
    //a.range - 1 because of OffByOne
    if (lines.some((a) => a.depth === second && !transformRange(second + delay, a.range - 1))) {
      return false
    }
    second++
  }
  return delay
}

const solveSecondTask = (lines) => {
  let delay = 0
  while (true) {
    let result = didPacketCameThrough(delay, lines)
    if (result) {
      return result
    }
    delay++
  }
}

const solveTasks = (inputString) => {
  let lines = inputString.split('\n').map((line) => {
    let [depth, range] = [...line.split(': ').map(a => parseInt(a))]
    return {depth, range}
  })
  console.log(solveFirstTask([...lines]), solveSecondTask([...lines]))

}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)