const fs = require('fs-extra')
const path = require('path')

const solveFirstTask = (lines) => {
  let second = 0
  let caught = []

  const transformRange = (range) => range - Math.abs((second % (2 * range)) - range)

  while (second <= lines.reduce((c, a) => Math.max(c, a.depth), 0)) {
    //a.range - 1 because of OffByOne
    let currentlyCaught = lines.filter((a) => a.depth === second && transformRange(a.range - 1) === 0)
    caught = caught.concat(currentlyCaught)
    second++
  }

  return caught.reduce((c, a) => c + a.depth * a.range, 0)
}

const solveTasks = (inputString) => {
  let lines = inputString.split('\n').map((line) => {
    let [depth, range] = [...line.split(': ').map(a => parseInt(a))]
    return {depth, range}
  })
  console.log(solveFirstTask([...lines]))

}
fs.readFile(path.join(__dirname, 'input.txt'), 'utf8').then(solveTasks)